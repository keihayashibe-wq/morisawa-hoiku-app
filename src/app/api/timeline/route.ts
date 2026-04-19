import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.timelinePost.findMany({
    include: {
      author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      images: true,
      comments: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      likes: true,
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const post = await prisma.timelinePost.create({
    data: {
      authorId: user.userId,
      content: body.content,
      classFilter: body.classFilter,
      images: body.imageUrls?.length
        ? { create: body.imageUrls.map((url: string) => ({ imageUrl: url })) }
        : undefined,
    },
    include: {
      author: { select: { id: true, name: true, role: true } },
      images: true,
      comments: true,
      likes: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json(post);
}
