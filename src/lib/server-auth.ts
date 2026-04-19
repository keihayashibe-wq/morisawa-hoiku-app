import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");
  const user = verifyToken(token);
  if (!user) redirect("/login");
  return user;
}

export async function getOptionalAuth(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
