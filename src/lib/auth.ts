import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_KEY = process.env.JWT_KEY || "aidges";
const COOKIE_NAME = "aikvis_admin_token";

export function signAdminToken(payload: { id: number; username: string }) {
  return jwt.sign(payload, JWT_KEY, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, JWT_KEY) as { id: number; username: string };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export { COOKIE_NAME };
