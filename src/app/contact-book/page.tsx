import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import ContactBookClient from "./ContactBookClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ContactBookPage() {
  const user = await requireAuth();
  const today = getTodayString();

  const children = user.role === "PARENT"
    ? await prisma.child.findMany({ where: { parents: { some: { parentId: user.userId } } }, orderBy: { name: "asc" } })
    : await prisma.child.findMany({ orderBy: { name: "asc" } });

  let entries: unknown[] = [];
  if (children.length > 0) {
    entries = await prisma.contactBook.findMany({
      where: { childId: children[0].id, date: today },
      include: { child: true, author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  return <ContactBookClient
    user={user}
    initialChildren={children.map(c => ({ id: c.id, name: c.name }))}
    initialEntries={JSON.parse(JSON.stringify(entries))}
    initialDate={today}
  />;
}
