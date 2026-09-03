import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/shared/types/database";
import { getSupabaseEnv } from "@/shared/lib/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseEnv();

  return createBrowserClient<Database>(url, key);
}
