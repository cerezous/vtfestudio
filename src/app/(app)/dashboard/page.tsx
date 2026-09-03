import { StudyDashboard } from "@/modules/dashboard/components/study-dashboard";
import { requireStaffSession } from "@/modules/auth/session";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireStaffSession();

  return <StudyDashboard profile={session.profile} />;
}
