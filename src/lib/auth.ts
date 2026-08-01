import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";

const COOKIE_NAME = "aikvis_admin_token";

function getJwtKey() {
  return (process.env.JWT_KEY || "aidges").trim();
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

export function signAdminToken(payload: { id: number; username: string }) {
  return jwt.sign(payload, getJwtKey(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, getJwtKey()) as { id: number; username: string };
  } catch {
    return null;
  }
}

export function getMasterAdminUsername() {
  return (process.env.ADMIN_USERNAME || "admin").trim();
}

export function isMasterAdmin(username: string) {
  return username.trim() === getMasterAdminUsername();
}

export interface AdminSession {
  id: number;
  username: string;
  isMaster: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  noStore();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = verifyAdminToken(token);
  if (!session) return null;
  return {
    id: session.id,
    username: session.username,
    isMaster: isMasterAdmin(session.username),
  };
}

export async function requireMasterSession(): Promise<
  | { session: AdminSession; response: null }
  | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!isMasterAdmin(session.username)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Forbidden — master admin only" },
        { status: 403 }
      ),
    };
  }
  return { session, response: null };
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, getAdminCookieOptions());
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });
}

export { COOKIE_NAME };
