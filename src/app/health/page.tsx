import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import HealthClient from "./HealthClient";

export default async function HealthPage() {
  const user = await requireAuth();
  const children = user.role === "PARENT"
    ? await prisma.child.findMany({ where: { parents: { some: { parentId: user.userId } } }, orderBy: { name: "asc" } })
    : await prisma.child.findMany({ orderBy: { name: "asc" } });

  const recordWhere = user.role === "PARENT" ? { childId: { in: children.map(c => c.id) } } : (children[0] ? { childId: children[0].id } : {});
  const records = await prisma.healthRecord.findMany({
    where: recordWhere, include: { child: true, recordedBy: { select: { name: true } } }, orderBy: { date: "desc" }, take: 100,
  });

  return <HealthClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialRecords={JSON.parse(JSON.stringify(records))} />;
}
