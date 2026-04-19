import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const user = await requireAuth();

  const posts = await prisma.timelinePost.findMany({
    include: {
      author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      images: true,
      comments: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      likes: true,
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    comments: p.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    likes: p.likes.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
  }));

  return <TimelineClient user={user} initialPosts={serialized} />;
}
