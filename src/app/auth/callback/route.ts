import { NextResponse } from "next/server";

import { getStaffSession } from "@/modules/auth/session";
import { ROUTES } from "@/shared/lib/constants";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth`);
  }

  const session = await getStaffSession();
  const destination = session ? ROUTES.dashboard : ROUTES.login;

  return NextResponse.redirect(`${origin}${destination}`);
}
