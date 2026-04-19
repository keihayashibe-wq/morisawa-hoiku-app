import { requireAuth } from "@/lib/server-auth";
import { getBroadcasts } from "@/lib/cached-queries";
import BroadcastClient from "./BroadcastClient";

export default async function BroadcastPage() {
  const user = await requireAuth();
  const broadcasts = await getBroadcasts();
  return <BroadcastClient user={user} initialBroadcasts={JSON.parse(JSON.stringify(broadcasts))} />;
}
