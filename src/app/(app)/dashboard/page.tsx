import { StudyDashboard } from "@/modules/dashboard/components/study-dashboard";
import { getDashboardSnapshot } from "@/modules/dashboard/server";
import { requireStaffSession } from "@/modules/auth/session";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [session, snapshot] = await Promise.all([
    requireStaffSession(),
    getDashboardSnapshot(),
  ]);

  return <StudyDashboard profile={session.profile} snapshot={snapshot} />;
}
