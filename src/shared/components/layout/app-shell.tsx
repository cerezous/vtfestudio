import type { ReactNode } from "react";

import type { StaffSession } from "@/modules/auth/session";
import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";

export function AppShell({
  session,
  children,
}: {
  session: StaffSession;
  children: ReactNode;
}) {
  return (
    <div className="h-svh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex h-svh min-w-0 flex-col lg:ml-64">
        <AppHeader profile={session.profile} />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
