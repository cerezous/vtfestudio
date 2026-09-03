import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { logError } from "@/shared/lib/logger";
import { resolveSessionGate } from "@/shared/lib/session-gate";
import { getSupabaseEnv } from "@/shared/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([headerName, headerValue]) => {
          supabaseResponse.headers.set(headerName, headerValue);
        });
      },
    },
  });

  let user: { sub?: string } | null = null;
  let authUnreachable = false;

  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      authUnreachable = true;
      logError("auth.middleware", error);
    } else {
      user = data?.claims ?? null;
    }
  } catch (error) {
    authUnreachable = true;
    logError("auth.middleware", error);
  }

  const gate = resolveSessionGate({
    user,
    pathname: request.nextUrl.pathname,
    authUnreachable,
  });

  if (gate.kind === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = gate.pathname;
    if (gate.next) {
      redirectUrl.searchParams.set("next", gate.next);
    } else {
      redirectUrl.searchParams.delete("next");
    }
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
