import { requireAuth } from "@/lib/server-auth";
import { getShifts, getTeachers } from "@/lib/cached-queries";
import ShiftsClient from "./ShiftsClient";

export default async function ShiftsPage() {
  const user = await requireAuth();
  if (user.role === "PARENT") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは保育士・管理者専用です</div></div>;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const [shifts, teachers] = await Promise.all([
    getShifts(monthStr, user.role === "TEACHER" ? user.userId : undefined),
    user.role === "ADMIN" ? getTeachers() : Promise.resolve([]),
  ]);
  return <ShiftsClient user={user} initialShifts={JSON.parse(JSON.stringify(shifts))} initialTeachers={teachers} initialYear={year} initialMonth={month} />;
}
