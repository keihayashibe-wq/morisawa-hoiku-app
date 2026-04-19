import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import EmergencyClient from "./EmergencyClient";

export default async function EmergencyPage() {
  const user = await requireAuth();
  const childWhere = user.role === "PARENT"
    ? { id: { in: (await prisma.childParent.findMany({ where: { parentId: user.userId }, select: { childId: true } })).map(c => c.childId) } }
    : {};
  const contactWhere = user.role === "PARENT" ? { childId: (childWhere as { id: { in: string[] } }).id } : {};

  const [children, contacts, pickupPersons] = await Promise.all([
    prisma.child.findMany({ where: childWhere, orderBy: { name: "asc" } }),
    prisma.emergencyContact.findMany({ where: contactWhere, include: { child: true }, orderBy: [{ childId: "asc" }, { priority: "asc" }] }),
    prisma.pickupPerson.findMany({ where: contactWhere, include: { child: true }, orderBy: { name: "asc" } }),
  ]);

  return <EmergencyClient user={user}
    initialChildren={children.map(c => ({ id: c.id, name: c.name }))}
    initialContacts={JSON.parse(JSON.stringify(contacts))}
    initialPickupPersons={JSON.parse(JSON.stringify(pickupPersons))}
  />;
}
