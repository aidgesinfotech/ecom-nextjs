import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    await pool.query(
      "INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email",
      [email]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
