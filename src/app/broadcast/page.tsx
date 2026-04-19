import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import BroadcastClient from "./BroadcastClient";

export default async function BroadcastPage() {
  const user = await requireAuth();
  const broadcasts = await prisma.emergencyBroadcast.findMany({
    include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20,
  });
  return <BroadcastClient user={user} initialBroadcasts={JSON.parse(JSON.stringify(broadcasts))} />;
}
