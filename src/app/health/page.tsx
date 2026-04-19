import { requireAuth } from "@/lib/server-auth";
import { getChildrenSimple, getHealthRecords, getParentChildren } from "@/lib/cached-queries";
import HealthClient from "./HealthClient";

export default async function HealthPage() {
  const user = await requireAuth();
  const children = user.role === "PARENT" ? await getParentChildren(user.userId) : await getChildrenSimple();
  const records = await getHealthRecords(children[0]?.id);
  return <HealthClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialRecords={JSON.parse(JSON.stringify(records))} />;
}
