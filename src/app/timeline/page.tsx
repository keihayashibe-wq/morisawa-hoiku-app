import { requireAuth } from "@/lib/server-auth";
import { getTimelinePosts } from "@/lib/cached-queries";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const user = await requireAuth();
  const posts = await getTimelinePosts();
  return <TimelineClient user={user} initialPosts={JSON.parse(JSON.stringify(posts))} />;
}
