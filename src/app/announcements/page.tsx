import { requireAuth } from "@/lib/server-auth";
import { getAnnouncements } from "@/lib/cached-queries";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const user = await requireAuth();
  const announcements = await getAnnouncements(user.role);
  return <AnnouncementsClient user={user} initialAnnouncements={JSON.parse(JSON.stringify(announcements))} />;
}
