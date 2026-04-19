import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは管理者専用です</div></div>;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true }, orderBy: { createdAt: "desc" },
  });
  return <UsersClient user={user} initialUsers={JSON.parse(JSON.stringify(users))} />;
}
