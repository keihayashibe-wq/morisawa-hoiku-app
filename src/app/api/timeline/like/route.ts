import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();

  const existing = await prisma.timelineLike.findUnique({
    where: { postId_userId: { postId, userId: user.userId } },
  });

  if (existing) {
    await prisma.timelineLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.timelineLike.create({ data: { postId, userId: user.userId } });
    return NextResponse.json({ liked: true });
  }
}
