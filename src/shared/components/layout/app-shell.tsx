import type { ReactNode } from "react";

import type { StaffSession } from "@/modules/auth/session";
import { AppHeader } from "@/shared/components/layout/app-header";

export function AppShell({
  session,
  children,
}: {
  session: StaffSession;
  children: ReactNode;
}) {
  return (
    <div className="flex h-svh min-w-0 flex-col overflow-hidden bg-background" data-app-shell>
      <div data-app-chrome>
        <AppHeader profile={session.profile} />
      </div>
      <div data-app-main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
