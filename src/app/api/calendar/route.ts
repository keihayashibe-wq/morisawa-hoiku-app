import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM format

  const where: Record<string, unknown> = {};
  if (month) {
    where.date = { startsWith: month };
  }

  const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      category: body.category || "EVENT",
      allDay: body.allDay ?? true,
    },
  });

  return NextResponse.json(event);
}
