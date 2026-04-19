import { requireAuth } from "@/lib/server-auth";
import { getEvents } from "@/lib/cached-queries";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const user = await requireAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const events = await getEvents(`${year}-${String(month).padStart(2, "0")}`);
  return <CalendarClient user={user} initialEvents={JSON.parse(JSON.stringify(events))} initialYear={year} initialMonth={month} />;
}
