import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import PhotosClient from "./PhotosClient";

export default async function PhotosPage() {
  const user = await requireAuth();
  const albums = await prisma.photoAlbum.findMany({
    include: { photos: true, createdBy: { select: { name: true } }, _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <PhotosClient user={user} initialAlbums={JSON.parse(JSON.stringify(albums))} />;
}
