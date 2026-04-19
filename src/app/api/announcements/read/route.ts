import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { announcementId } = await req.json();

  await prisma.readReceipt.upsert({
    where: { announcementId_userId: { announcementId, userId: user.userId } },
    update: {},
    create: { announcementId, userId: user.userId },
  });

  return NextResponse.json({ success: true });
}
