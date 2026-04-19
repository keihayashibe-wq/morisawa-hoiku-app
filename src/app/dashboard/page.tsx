import { requireAuth } from "@/lib/server-auth";
import { getDashboardData } from "@/lib/cached-queries";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireAuth();
  const data = await getDashboardData();
  return <DashboardClient user={user} initialData={JSON.parse(JSON.stringify(data))} />;
}
