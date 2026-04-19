import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTodayString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || getTodayString();
  const childId = searchParams.get("childId");

  const where: Record<string, unknown> = { date };
  if (childId) where.childId = childId;

  if (user.role === "PARENT") {
    const childrenIds = await prisma.childParent.findMany({
      where: { parentId: user.userId },
      select: { childId: true },
    });
    where.childId = { in: childrenIds.map((c) => c.childId) };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: { child: { include: { class: true } } },
    orderBy: { child: { name: "asc" } },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const date = body.date || getTodayString();
  const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const record = await prisma.attendance.upsert({
    where: { childId_date: { childId: body.childId, date } },
    update: body.action === "checkin"
      ? { checkInTime: now, checkInBy: user.name }
      : { checkOutTime: now, checkOutBy: user.name, pickupPerson: body.pickupPerson },
    create: {
      childId: body.childId,
      date,
      ...(body.action === "checkin"
        ? { checkInTime: now, checkInBy: user.name }
        : { checkOutTime: now, checkOutBy: user.name, pickupPerson: body.pickupPerson }),
    },
  });

  return NextResponse.json(record);
}
