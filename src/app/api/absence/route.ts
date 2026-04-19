import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;

  if (user.role === "PARENT") {
    const childrenIds = await prisma.childParent.findMany({
      where: { parentId: user.userId },
      select: { childId: true },
    });
    where.childId = { in: childrenIds.map((c) => c.childId) };
  }

  const reports = await prisma.absenceReport.findMany({
    where,
    include: { child: true, parent: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const report = await prisma.absenceReport.create({
    data: {
      childId: body.childId,
      parentId: user.userId,
      date: body.date,
      type: body.type,
      reason: body.reason,
      arrivalTime: body.arrivalTime,
      pickupTime: body.pickupTime,
    },
  });

  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, confirmed } = await req.json();
  const report = await prisma.absenceReport.update({
    where: { id },
    data: { confirmed },
  });

  return NextResponse.json(report);
}
