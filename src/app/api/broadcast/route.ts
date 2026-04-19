import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const broadcasts = await prisma.emergencyBroadcast.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(broadcasts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const broadcast = await prisma.emergencyBroadcast.create({
    data: {
      authorId: user.userId,
      title: body.title,
      content: body.content,
      severity: body.severity || "WARNING",
    },
  });

  return NextResponse.json(broadcast);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, isActive } = await req.json();

  const broadcast = await prisma.emergencyBroadcast.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json(broadcast);
}
