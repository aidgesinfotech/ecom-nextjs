import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await pool.query(
      "INSERT INTO contact_messages (first_name, last_name, email, message) VALUES (?, ?, ?, ?)",
      [body.first_name, body.last_name, body.email, body.message]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
