import { requireAuth } from "@/lib/server-auth";
import { getPhotoAlbums } from "@/lib/cached-queries";
import PhotosClient from "./PhotosClient";

export default async function PhotosPage() {
  const user = await requireAuth();
  const albums = await getPhotoAlbums();
  return <PhotosClient user={user} initialAlbums={JSON.parse(JSON.stringify(albums))} />;
}
