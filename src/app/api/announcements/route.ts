import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [{ targetRole: "ALL" }, { targetRole: user.role }],
    },
    include: {
      author: { select: { name: true, role: true } },
      readReceipts: { select: { userId: true } },
      _count: { select: { readReceipts: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const announcement = await prisma.announcement.create({
    data: {
      authorId: user.userId,
      title: body.title,
      content: body.content,
      category: body.category || "GENERAL",
      targetRole: body.targetRole || "ALL",
      pinned: body.pinned || false,
    },
  });

  return NextResponse.json(announcement);
}
