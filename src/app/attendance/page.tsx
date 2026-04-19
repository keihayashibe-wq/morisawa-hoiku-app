import { requireAuth } from "@/lib/server-auth";
import { getChildrenSimple, getAttendance, getParentChildren } from "@/lib/cached-queries";
import AttendanceClient from "./AttendanceClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AttendancePage() {
  const user = await requireAuth();
  const today = getTodayString();
  const children = user.role === "PARENT"
    ? await getParentChildren(user.userId)
    : await getChildrenSimple();
  const records = await getAttendance(today);
  return <AttendanceClient user={user} initialChildren={JSON.parse(JSON.stringify(children))} initialRecords={JSON.parse(JSON.stringify(records))} initialDate={today} />;
}
