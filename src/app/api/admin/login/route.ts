import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { COOKIE_NAME, signAdminToken } from "@/lib/auth";
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

    const token = signAdminToken({ id: admin.id, username: admin.username });
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
