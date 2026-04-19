import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import ShiftsClient from "./ShiftsClient";

export default async function ShiftsPage() {
  const user = await requireAuth();
  if (user.role === "PARENT") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは保育士・管理者専用です</div></div>;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const where: Record<string, unknown> = { date: { startsWith: monthStr } };
  if (user.role === "TEACHER") where.teacherId = user.userId;

  const shifts = await prisma.shift.findMany({ where, include: { teacher: { select: { id: true, name: true } } }, orderBy: [{ date: "asc" }, { startTime: "asc" }] });

  let teachers: Array<{ id: string; name: string }> = [];
  if (user.role === "ADMIN") {
    teachers = await prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true } });
  }

  return <ShiftsClient user={user} initialShifts={JSON.parse(JSON.stringify(shifts))} initialTeachers={teachers} initialYear={year} initialMonth={month} />;
}
