import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import AbsenceClient from "./AbsenceClient";

export default async function AbsencePage() {
  const user = await requireAuth();

  const children = user.role === "PARENT"
    ? await prisma.child.findMany({ where: { parents: { some: { parentId: user.userId } } }, orderBy: { name: "asc" } })
    : await prisma.child.findMany({ orderBy: { name: "asc" } });

  const where: Record<string, unknown> = {};
  if (user.role === "PARENT") where.childId = { in: children.map(c => c.id) };

  const reports = await prisma.absenceReport.findMany({
    where, include: { child: true, parent: { select: { name: true } } },
    orderBy: { createdAt: "desc" }, take: 50,
  });

  return <AbsenceClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialReports={JSON.parse(JSON.stringify(reports))} />;
}
