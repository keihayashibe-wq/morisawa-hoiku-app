import { requireAuth } from "@/lib/server-auth";
import { getParentChildren, getChildrenSimple, getAbsenceReports } from "@/lib/cached-queries";
import AbsenceClient from "./AbsenceClient";

export default async function AbsencePage() {
  const user = await requireAuth();
  const children = user.role === "PARENT" ? await getParentChildren(user.userId) : await getChildrenSimple();
  const reports = await getAbsenceReports();
  return <AbsenceClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialReports={JSON.parse(JSON.stringify(reports))} />;
}
