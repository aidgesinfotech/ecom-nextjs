import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db-init";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "SETUP_SECRET is not configured on the server." },
      { status: 503 }
    );
  }

  const provided = req.headers.get("x-setup-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();
    return NextResponse.json({
      success: true,
      message: "Database initialized. Tables and default data are ready.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database setup failed" }, { status: 500 });
  }
}
