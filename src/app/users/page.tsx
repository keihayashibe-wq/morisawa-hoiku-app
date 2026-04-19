import { requireAuth } from "@/lib/server-auth";
import { getAllUsers } from "@/lib/cached-queries";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは管理者専用です</div></div>;
  const users = await getAllUsers();
  return <UsersClient user={user} initialUsers={JSON.parse(JSON.stringify(users))} />;
}
