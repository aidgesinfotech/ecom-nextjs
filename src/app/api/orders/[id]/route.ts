import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  return NextResponse.json({ success: true });
}
