import { NextRequest, NextResponse } from "next/server";
import { createAdminUser, listAdmins } from "@/lib/admins";
import { getMasterAdminUsername, requireMasterSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

function validatePassword(password: unknown) {
  const value = String(password ?? "");
  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

export async function GET() {
  const auth = await requireMasterSession();
  if (auth.response) return auth.response;

  await ensureAppReady();
  const admins = await listAdmins();
  const masterUsername = getMasterAdminUsername();

  return NextResponse.json({
    admins: admins.map((admin) => ({
      ...admin,
      isMaster: admin.username === masterUsername,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireMasterSession();
  if (auth.response) return auth.response;

  await ensureAppReady();
  const body = await req.json();
  const username = String(body.username ?? "").trim();
  const password = body.password;

  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  try {
    const admin = await createAdminUser(username, String(password));
    return NextResponse.json({
      success: true,
      admin: {
        ...admin,
        isMaster: admin.username === getMasterAdminUsername(),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("Duplicate")
        ? "Username already exists."
        : "Failed to create admin user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
