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

  const contacts = await prisma.emergencyContact.findMany({
    where,
    include: { child: true },
    orderBy: [{ childId: "asc" }, { priority: "asc" }],
  });

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const contact = await prisma.emergencyContact.create({
    data: {
      childId: body.childId,
      name: body.name,
      relation: body.relation,
      phone: body.phone,
      priority: body.priority || 1,
    },
  });

  return NextResponse.json(contact);
}
