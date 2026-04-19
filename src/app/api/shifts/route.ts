import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const where: Record<string, unknown> = {};
  if (month) where.date = { startsWith: month };

  if (user.role === "TEACHER") {
    where.teacherId = user.userId;
  }

  const shifts = await prisma.shift.findMany({
    where,
    include: { teacher: { select: { id: true, name: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(shifts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const shift = await prisma.shift.upsert({
    where: { teacherId_date: { teacherId: body.teacherId, date: body.date } },
    update: {
      startTime: body.startTime,
      endTime: body.endTime,
      shiftType: body.shiftType || "NORMAL",
      notes: body.notes,
    },
    create: {
      teacherId: body.teacherId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      shiftType: body.shiftType || "NORMAL",
      notes: body.notes,
    },
  });

  return NextResponse.json(shift);
}
