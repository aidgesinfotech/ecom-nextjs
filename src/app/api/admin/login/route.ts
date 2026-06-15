import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { setAdminSessionCookie, signAdminToken } from "@/lib/auth";
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
    await setAdminSessionCookie(token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
