import { cache } from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/shared/lib/constants";
import { createClient } from "@/shared/lib/supabase/server";
import type { Profile } from "@/shared/types/database";

type StaffClient = Awaited<ReturnType<typeof createClient>>;

export type StaffSession = {
  userId: string;
  profile: Profile;
};

export async function loadStaffSession(
  supabase: StaffClient,
): Promise<StaffSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return {
    userId: user.id,
    profile,
  };
}

export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const supabase = await createClient();
  return loadStaffSession(supabase);
});

export async function requireStaffSession() {
  const session = await getStaffSession();

  if (!session) {
    redirect(ROUTES.login);
  }

  return session;
}
