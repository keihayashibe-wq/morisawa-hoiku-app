import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません" }, { status: 401 });
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
