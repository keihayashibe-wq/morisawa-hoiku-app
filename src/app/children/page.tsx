import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import ChildrenClient from "./ChildrenClient";

export default async function ChildrenPage() {
  const user = await requireAuth();
  const children = user.role === "PARENT"
    ? await prisma.child.findMany({ where: { parents: { some: { parentId: user.userId } } }, include: { class: true, allergies: true, parents: { include: { parent: true } } }, orderBy: { name: "asc" } })
    : await prisma.child.findMany({ include: { class: true, allergies: true, parents: { include: { parent: true } } }, orderBy: { name: "asc" } });
  return <ChildrenClient user={user} initialChildren={JSON.parse(JSON.stringify(children))} />;
}
