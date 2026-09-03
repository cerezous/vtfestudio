import { redirect } from "next/navigation";

import { getStaffSession } from "@/modules/auth/session";
import { ROUTES } from "@/shared/lib/constants";

export default async function HomePage() {
  const session = await getStaffSession();
  redirect(session ? ROUTES.dashboard : ROUTES.login);
}
