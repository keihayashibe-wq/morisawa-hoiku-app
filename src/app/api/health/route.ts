import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");

  const where: Record<string, unknown> = {};
  if (childId) where.childId = childId;

  if (user.role === "PARENT") {
    const childrenIds = await prisma.childParent.findMany({
      where: { parentId: user.userId },
      select: { childId: true },
    });
    where.childId = { in: childrenIds.map((c) => c.childId) };
  }

  const records = await prisma.healthRecord.findMany({
    where,
    include: { child: true, recordedBy: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const record = await prisma.healthRecord.create({
    data: {
      childId: body.childId,
      date: body.date,
      recordedById: user.userId,
      temperature: body.temperature ? parseFloat(body.temperature) : undefined,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      height: body.height ? parseFloat(body.height) : undefined,
      symptoms: body.symptoms,
      notes: body.notes,
    },
  });

  return NextResponse.json(record);
}
