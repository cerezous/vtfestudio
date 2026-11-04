import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/shared/types/database";
import { getSupabaseEnv } from "@/shared/lib/supabase/env";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: BrowserClient | null = null;

export function createClient() {
  const { url, key } = getSupabaseEnv();

  if (typeof window === "undefined") {
    return createBrowserClient<Database>(url, key);
  }

  browserClient ??= createBrowserClient<Database>(url, key);
  return browserClient;
}
