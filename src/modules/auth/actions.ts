"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { ROUTES } from "@/shared/lib/constants";
import { logError } from "@/shared/lib/logger";
import { consumeRateLimit, resetRateLimit } from "@/shared/lib/rate-limit";
import { createClient } from "@/shared/lib/supabase/server";
import { mapAuthError } from "@/modules/auth/errors";
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

  const supabase = await createClient();
  const { data: email, error: lookupError } = await supabase.rpc(
    "email_for_username",
    { p_username: parsed.data.username },
  );

  if (lookupError) {
    logError("auth.login", lookupError);
    await waitAtLeast(startedAt, LOGIN_MIN_MS);
    return { error: "Usuario o contraseña incorrectos." };
  }

  if (!email) {
    await waitAtLeast(startedAt, LOGIN_MIN_MS);
    return { error: "Usuario o contraseña incorrectos." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: normalizeLoginPassword(parsed.data.password),
  });

  await waitAtLeast(startedAt, LOGIN_MIN_MS);

  if (error) {
    return { error: mapAuthError(error.message) };
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
