import type { ReactNode } from "react";

import { requireStaffSession } from "@/modules/auth/session";
import { AppShell } from "@/shared/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireStaffSession();

  return <AppShell session={session}>{children}</AppShell>;
}
