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

  const persons = await prisma.pickupPerson.findMany({
    where,
    include: { child: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(persons);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const person = await prisma.pickupPerson.create({
    data: {
      childId: body.childId,
      name: body.name,
      relation: body.relation,
      phone: body.phone,
      notes: body.notes,
    },
  });

  return NextResponse.json(person);
}
