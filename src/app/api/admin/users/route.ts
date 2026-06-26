import { NextRequest, NextResponse } from "next/server";
import { createAdminUser, listAdmins } from "@/lib/admins";
import { requireMasterSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

function validatePassword(password: unknown) {
  const value = String(password || "");
  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

function validateUsername(username: unknown) {
  const value = String(username || "").trim().toLowerCase();
  if (value.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!/^[a-z0-9._-]+$/.test(value)) {
    return "Username can only use letters, numbers, dots, dashes, and underscores.";
  }
  return null;
}

export async function GET() {
  const auth = await requireMasterSession();
  if (auth.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureAppReady();
  const admins = await listAdmins();
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const auth = await requireMasterSession();
  if (auth.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureAppReady();
    const body = await req.json();
    const usernameError = validateUsername(body.username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (String(body.password) !== String(body.confirmPassword || body.password)) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const admin = await createAdminUser(String(body.username), String(body.password));
    return NextResponse.json({ admin });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create admin";
    if (message.includes("Duplicate") || message.includes("ER_DUP_ENTRY")) {
      return NextResponse.json({ error: "Username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create admin user." }, { status: 500 });
  }
}
