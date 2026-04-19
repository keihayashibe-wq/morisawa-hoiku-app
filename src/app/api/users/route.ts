import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 });

  const hashedPassword = await hashPassword(body.password);

  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      name: body.name,
      role: body.role,
      phone: body.phone,
    },
    select: { id: true, email: true, name: true, role: true, phone: true },
  });

  return NextResponse.json(newUser);
}
