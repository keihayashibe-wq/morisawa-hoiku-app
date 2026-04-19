import { requireAuth } from "@/lib/server-auth";
import { getAllChildren, getParentChildren } from "@/lib/cached-queries";
import ChildrenClient from "./ChildrenClient";

export default async function ChildrenPage() {
  const user = await requireAuth();
  const children = user.role === "PARENT" ? await getParentChildren(user.userId) : await getAllChildren();
  return <ChildrenClient user={user} initialChildren={JSON.parse(JSON.stringify(children))} />;
}
