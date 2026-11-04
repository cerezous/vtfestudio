"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { ROUTES } from "@/shared/lib/constants";
import { logError } from "@/shared/lib/logger";
import { consumeRateLimit, resetRateLimit } from "@/shared/lib/rate-limit";
import { createClient } from "@/shared/lib/supabase/server";
import { getSupabaseEnv } from "@/shared/lib/supabase/env";
import { normalizeLoginPassword } from "@/modules/auth/password";
import { loginSchema, type LoginValues } from "@/modules/auth/schemas";
import { loadStaffSession } from "@/modules/auth/session";

type ActionResult = { error: string } | { success: string };

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_MIN_MS = 250;

async function clientKey(username: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  return `signin:${ip}:${username}`;
}

async function waitAtLeast(startedAt: number, minMs: number) {
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

export async function signInAction(
  values: LoginValues,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const startedAt = Date.now();
  const limitKey = await clientKey(parsed.data.username);

  if (!consumeRateLimit(limitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
    await waitAtLeast(startedAt, LOGIN_MIN_MS);
    return { error: "Demasiados intentos. Espera unos minutos." };
  }

  const { url, key } = getSupabaseEnv();
  let loginResponse: Response;

  try {
    loginResponse = await fetch(`${url}/functions/v1/staff-login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: key,
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        username: parsed.data.username,
        password: normalizeLoginPassword(parsed.data.password),
      }),
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    logError("auth.login", error);
    await waitAtLeast(startedAt, LOGIN_MIN_MS);
    return { error: "No se pudo iniciar sesión. Intenta de nuevo." };
  }

  const payload = (await loginResponse.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
  } | null;

  await waitAtLeast(startedAt, LOGIN_MIN_MS);

  if (loginResponse.status === 429) {
    return { error: "Demasiados intentos. Espera unos minutos." };
  }

  if (
    !loginResponse.ok ||
    !payload?.access_token ||
    !payload.refresh_token
  ) {
    return {
      error: loginResponse.status === 401
        ? "Usuario o contraseña incorrectos."
        : "No se pudo iniciar sesión. Intenta de nuevo.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });

  if (error) {
    logError("auth.login", error);
    return { error: "No se pudo iniciar sesión. Intenta de nuevo." };
  }

  resetRateLimit(limitKey);

  const session = await loadStaffSession(supabase);

  if (!session) {
    await supabase.auth.signOut();
    return {
      error:
        "La cuenta existe, pero no se pudo abrir el perfil. Recarga e intenta de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.dashboard);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.login);
}
