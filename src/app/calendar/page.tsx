import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const user = await requireAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const events = await prisma.event.findMany({ where: { date: { startsWith: monthStr } }, orderBy: { date: "asc" } });
  return <CalendarClient user={user} initialEvents={JSON.parse(JSON.stringify(events))} initialYear={year} initialMonth={month} />;
}
