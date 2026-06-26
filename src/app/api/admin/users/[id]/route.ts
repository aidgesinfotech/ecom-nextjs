import { NextRequest, NextResponse } from "next/server";
import {
  countMasterAdmins,
  deleteAdminUser,
  getAdminById,
  updateAdminPassword,
} from "@/lib/admins";
import { requireMasterSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

function validatePassword(password: unknown) {
  const value = String(password || "");
  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMasterSession();
  if (auth.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

  try {
    await ensureAppReady();
    const target = await getAdminById(id);
    if (!target) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    const body = await req.json();
    const passwordError = validatePassword(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (String(body.password) !== String(body.confirmPassword || body.password)) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    await updateAdminPassword(id, String(body.password));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMasterSession();
  if (auth.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.error === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

  if (auth.session!.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    await ensureAppReady();
    const target = await getAdminById(id);
    if (!target) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    if (target.isMaster) {
      const masters = await countMasterAdmins();
      if (masters <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the only master admin." },
          { status: 400 }
        );
      }
    }

    await deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete admin user." }, { status: 500 });
  }
}
