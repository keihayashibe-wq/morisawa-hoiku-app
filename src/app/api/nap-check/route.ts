import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const childId = searchParams.get("childId");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;
  if (childId) where.childId = childId;

  const checks = await prisma.napCheck.findMany({
    where,
    include: { child: true, checkedBy: { select: { name: true } } },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 100,
  });

  return NextResponse.json(checks);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const check = await prisma.napCheck.create({
    data: {
      childId: body.childId,
      date: body.date,
      time: body.time,
      checkedById: user.userId,
      position: body.position,
      breathing: body.breathing,
      notes: body.notes,
    },
  });

  return NextResponse.json(check);
}
