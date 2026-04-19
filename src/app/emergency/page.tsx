import { requireAuth } from "@/lib/server-auth";
import { getChildrenSimple, getEmergencyContacts, getPickupPersons, getParentChildren } from "@/lib/cached-queries";
import EmergencyClient from "./EmergencyClient";

export default async function EmergencyPage() {
  const user = await requireAuth();
  const children = user.role === "PARENT" ? await getParentChildren(user.userId) : await getChildrenSimple();
  const [contacts, pickupPersons] = await Promise.all([getEmergencyContacts(), getPickupPersons()]);
  const childIds = new Set(children.map(c => c.id));
  const filteredContacts = user.role === "PARENT" ? contacts.filter(c => childIds.has(c.childId)) : contacts;
  const filteredPickup = user.role === "PARENT" ? pickupPersons.filter(p => childIds.has(p.childId)) : pickupPersons;
  return <EmergencyClient user={user} initialChildren={children.map(c => ({ id: c.id, name: c.name }))} initialContacts={JSON.parse(JSON.stringify(filteredContacts))} initialPickupPersons={JSON.parse(JSON.stringify(filteredPickup))} />;
}
