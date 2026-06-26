import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

const JWT_KEY = (process.env.JWT_KEY || "aidges").trim();
const COOKIE_NAME = "aikvis_admin_token";

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

export function signAdminToken(payload: { id: number; username: string; isMaster: boolean }) {
  return jwt.sign(payload, JWT_KEY, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, JWT_KEY) as {
      id: number;
      username: string;
      isMaster?: boolean;
    };
  } catch {
    return null;
  }
}

export type AdminSession = {
  id: number;
  username: string;
  isMaster: boolean;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  noStore();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyAdminToken(token);
  if (!payload) return null;

  if (payload.isMaster !== undefined) {
    return {
      id: payload.id,
      username: payload.username,
      isMaster: Boolean(payload.isMaster),
    };
  }

  const { getAdminIsMaster } = await import("./admins");
  const isMaster = await getAdminIsMaster(payload.id);
  return {
    id: payload.id,
    username: payload.username,
    isMaster,
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null as AdminSession | null, error: "Unauthorized" as const };
  }
  return { session, error: null };
}

export async function requireMasterSession() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null as AdminSession | null, error: "Unauthorized" as const };
  }
  if (!session.isMaster) {
    return { session, error: "Forbidden" as const };
  }
  return { session, error: null };
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
