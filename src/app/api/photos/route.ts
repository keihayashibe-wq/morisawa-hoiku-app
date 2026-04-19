import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const albums = await prisma.photoAlbum.findMany({
    include: { photos: true, createdBy: { select: { name: true } }, _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(albums);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const album = await prisma.photoAlbum.create({
    data: {
      title: body.title,
      description: body.description,
      date: body.date,
      createdById: user.userId,
      photos: body.photoUrls?.length
        ? { create: body.photoUrls.map((url: string, i: number) => ({ imageUrl: url, caption: body.captions?.[i] })) }
        : undefined,
    },
    include: { photos: true },
  });

  return NextResponse.json(album);
}
