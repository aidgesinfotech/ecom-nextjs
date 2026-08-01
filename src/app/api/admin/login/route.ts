import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import {
  COOKIE_NAME,
  getAdminCookieOptions,
  signAdminToken,
} from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";
import type { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    await ensureAppReady();
    const { username, password } = await req.json();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM admins WHERE username = ? LIMIT 1",
      [username]
    );
    const admin = rows[0];
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAdminToken({
      id: Number(admin.id),
      username: String(admin.username),
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, getAdminCookieOptions());
    return response;
  } catch (error) {
    const err = error as { message?: string; code?: string; stack?: string };
    console.error("[admin/login] failed:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    return NextResponse.json(
      {
        error: "Login failed",
        detail: err?.message || err?.code || "unknown",
      },
      { status: 500 }
    );
  }
}
