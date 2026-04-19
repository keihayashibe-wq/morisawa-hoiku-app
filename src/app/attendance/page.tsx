import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import AttendanceClient from "./AttendanceClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AttendancePage() {
  const user = await requireAuth();
  const today = getTodayString();

  const children = user.role === "PARENT"
    ? await prisma.child.findMany({ where: { parents: { some: { parentId: user.userId } } }, include: { class: true }, orderBy: { name: "asc" } })
    : await prisma.child.findMany({ include: { class: true }, orderBy: { name: "asc" } });

  const records = await prisma.attendance.findMany({
    where: { date: today, ...(user.role === "PARENT" ? { childId: { in: children.map(c => c.id) } } : {}) },
    include: { child: { include: { class: true } } },
    orderBy: { child: { name: "asc" } },
  });

  return <AttendanceClient
    user={user}
    initialChildren={JSON.parse(JSON.stringify(children))}
    initialRecords={JSON.parse(JSON.stringify(records))}
    initialDate={today}
  />;
}
