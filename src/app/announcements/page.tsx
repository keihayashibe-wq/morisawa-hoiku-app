import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const user = await requireAuth();
  const announcements = await prisma.announcement.findMany({
    where: { OR: [{ targetRole: "ALL" }, { targetRole: user.role }] },
    include: { author: { select: { name: true, role: true } }, readReceipts: { select: { userId: true } }, _count: { select: { readReceipts: true } } },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return <AnnouncementsClient user={user} initialAnnouncements={JSON.parse(JSON.stringify(announcements))} />;
}
