import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is missing from .env.local");
}

const secretKey = new TextEncoder().encode(secret);

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey);

  const cookieStore = await cookies();

  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 2 * 60 * 60,
  });
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete("admin_session");
}