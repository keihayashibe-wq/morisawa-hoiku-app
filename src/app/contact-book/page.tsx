import { requireAuth } from "@/lib/server-auth";
import { getParentChildren, getChildrenSimple, getContactBookEntries } from "@/lib/cached-queries";
import ContactBookClient from "./ContactBookClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ContactBookPage() {
  const user = await requireAuth();
  const today = getTodayString();
  const children = user.role === "PARENT"
    ? await getParentChildren(user.userId)
    : await getChildrenSimple();
  const entries = children.length > 0 ? await getContactBookEntries(children[0].id, today) : [];
  return <ContactBookClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialEntries={JSON.parse(JSON.stringify(entries))} initialDate={today} />;
}
