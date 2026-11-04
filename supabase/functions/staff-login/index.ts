import { createClient } from "npm:@supabase/supabase-js@2";

const WINDOW_SECONDS = 600;
const MAX_ATTEMPTS = 8;
const MIN_MS = 350;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

async function finish(startedAt: number, body: unknown, status: number) {
  const remaining = MIN_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
  return json(body, status);
}

Deno.serve(async (request) => {
  const startedAt = Date.now();

  if (request.method !== "POST") {
    return json({ error: "method" }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = request.headers.get("apikey");

  if (!url || !serviceKey || !apiKey) {
    return finish(startedAt, { error: "unavailable" }, 503);
  }

  let username = "";
  let password = "";

  try {
    const body = await request.json();
    username =
      typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return finish(startedAt, { error: "invalid" }, 401);
  }

  if (
    !username ||
    username.length > 32 ||
    !/^[a-z][a-z0-9._-]*$/.test(username) ||
    password.length < 8 ||
    password.length > 200
  ) {
    return finish(startedAt, { error: "invalid" }, 401);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bucket = `login:${username}`;

  const limit = await admin.rpc("consume_login_attempt", {
    p_bucket: bucket,
    p_limit: MAX_ATTEMPTS,
    p_window_seconds: WINDOW_SECONDS,
  });

  if (limit.error) {
    return finish(startedAt, { error: "unavailable" }, 503);
  }

  if (limit.data !== true) {
    return finish(startedAt, { error: "rate" }, 429);
  }

  const lookup = await admin.rpc("email_for_username", {
    p_username: username,
  });
  const email = typeof lookup.data === "string" ? lookup.data : "";

  if (lookup.error || !email) {
    return finish(startedAt, { error: "invalid" }, 401);
  }

  const tokenResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: apiKey,
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!tokenResponse.ok) {
    return finish(startedAt, { error: "invalid" }, 401);
  }

  const token = await tokenResponse.json();
  if (
    typeof token?.access_token !== "string" ||
    typeof token?.refresh_token !== "string"
  ) {
    return finish(startedAt, { error: "invalid" }, 401);
  }

  await admin.rpc("reset_login_attempt", { p_bucket: bucket });

  return finish(startedAt, {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
  }, 200);
});
