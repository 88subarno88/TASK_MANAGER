import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tm_session")?.value;
  let user = null;
  try {
    user = verifyToken(token);
  } catch {}
  return <DashboardClient user={user} />;
}
