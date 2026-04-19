import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let children;
  if (user.role === "PARENT") {
    children = await prisma.child.findMany({
      where: { parents: { some: { parentId: user.userId } } },
      include: { class: true, allergies: true, parents: { include: { parent: true } } },
      orderBy: { name: "asc" },
    });
  } else {
    children = await prisma.child.findMany({
      include: { class: true, allergies: true, parents: { include: { parent: true } } },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json(children);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const child = await prisma.child.create({
    data: {
      name: body.name,
      nameKana: body.nameKana,
      birthDate: body.birthDate,
      gender: body.gender,
      classId: body.classId,
      bloodType: body.bloodType,
      notes: body.notes,
    },
  });

  return NextResponse.json(child);
}
