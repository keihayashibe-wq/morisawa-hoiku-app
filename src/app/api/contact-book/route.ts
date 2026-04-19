import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTodayString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const date = searchParams.get("date") || getTodayString();

  const where: Record<string, unknown> = { date };
  if (childId) where.childId = childId;

  if (user.role === "PARENT") {
    const childrenIds = await prisma.childParent.findMany({
      where: { parentId: user.userId },
      select: { childId: true },
    });
    where.childId = { in: childrenIds.map((c) => c.childId) };
  }

  const entries = await prisma.contactBook.findMany({
    where,
    include: { child: true, author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const entry = await prisma.contactBook.upsert({
    where: {
      childId_date_authorId: {
        childId: body.childId,
        date: body.date || getTodayString(),
        authorId: user.userId,
      },
    },
    update: {
      homeMood: body.homeMood,
      homeTemp: body.homeTemp ? parseFloat(body.homeTemp) : undefined,
      homeMeal: body.homeMeal,
      homeSleep: body.homeSleep,
      homeBowel: body.homeBowel,
      homeNotes: body.homeNotes,
      schoolMood: body.schoolMood,
      schoolTemp: body.schoolTemp ? parseFloat(body.schoolTemp) : undefined,
      schoolMeal: body.schoolMeal,
      schoolSleep: body.schoolSleep,
      schoolBowel: body.schoolBowel,
      schoolActivity: body.schoolActivity,
      schoolNotes: body.schoolNotes,
    },
    create: {
      childId: body.childId,
      date: body.date || getTodayString(),
      authorId: user.userId,
      homeMood: body.homeMood,
      homeTemp: body.homeTemp ? parseFloat(body.homeTemp) : undefined,
      homeMeal: body.homeMeal,
      homeSleep: body.homeSleep,
      homeBowel: body.homeBowel,
      homeNotes: body.homeNotes,
      schoolMood: body.schoolMood,
      schoolTemp: body.schoolTemp ? parseFloat(body.schoolTemp) : undefined,
      schoolMeal: body.schoolMeal,
      schoolSleep: body.schoolSleep,
      schoolBowel: body.schoolBowel,
      schoolActivity: body.schoolActivity,
      schoolNotes: body.schoolNotes,
    },
  });

  return NextResponse.json(entry);
}
