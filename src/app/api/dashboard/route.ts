import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTodayString } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = getTodayString();

  const [
    totalChildren,
    todayAttendance,
    todayAbsence,
    recentAnnouncements,
    activeBroadcasts,
  ] = await Promise.all([
    prisma.child.count(),
    prisma.attendance.count({ where: { date: today, checkInTime: { not: null } } }),
    prisma.absenceReport.count({ where: { date: today, type: "ABSENT" } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { author: { select: { name: true } } } }),
    prisma.emergencyBroadcast.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const checkedOut = await prisma.attendance.count({
    where: { date: today, checkOutTime: { not: null } },
  });

  return NextResponse.json({
    totalChildren,
    todayAttendance,
    todayAbsence,
    todayPresent: todayAttendance - checkedOut,
    recentAnnouncements,
    activeBroadcasts,
  });
}
