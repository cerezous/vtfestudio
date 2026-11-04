import type { ReactNode } from "react";

import { requireStaffSession } from "@/modules/auth/session";

export default async function PrintLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStaffSession();

  return (
    <div data-print-page className="min-h-svh bg-white">
      {children}
    </div>
  );
}
