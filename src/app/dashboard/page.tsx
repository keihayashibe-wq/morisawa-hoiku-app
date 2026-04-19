import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const today = getTodayString();

  const [totalChildren, todayAttendance, todayAbsence, checkedOut, recentAnnouncements, activeBroadcasts] = await Promise.all([
    prisma.child.count(),
    prisma.attendance.count({ where: { date: today, checkInTime: { not: null } } }),
    prisma.absenceReport.count({ where: { date: today, type: "ABSENT" } }),
    prisma.attendance.count({ where: { date: today, checkOutTime: { not: null } } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { author: { select: { name: true } } } }),
    prisma.emergencyBroadcast.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const data = {
    totalChildren,
    todayAttendance,
    todayAbsence,
    todayPresent: todayAttendance - checkedOut,
    recentAnnouncements: recentAnnouncements.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })),
    activeBroadcasts,
  };

  return <DashboardClient user={user} initialData={data} />;
}
