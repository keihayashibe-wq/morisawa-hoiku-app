import { requireAuth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import NapCheckClient from "./NapCheckClient";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function NapCheckPage() {
  const user = await requireAuth();
  if (user.role === "PARENT") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは保育士専用です</div></div>;

  const today = getTodayString();
  const [children, checks] = await Promise.all([
    prisma.child.findMany({ include: { class: true }, orderBy: { name: "asc" } }),
    prisma.napCheck.findMany({ where: { date: today }, include: { child: true, checkedBy: { select: { name: true } } }, orderBy: [{ date: "desc" }, { time: "desc" }] }),
  ]);

  return <NapCheckClient user={user} initialChildren={JSON.parse(JSON.stringify(children))} initialChecks={JSON.parse(JSON.stringify(checks))} initialDate={today} />;
}
