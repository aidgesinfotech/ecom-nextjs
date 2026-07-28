import { NextResponse } from "next/server";
import {
  countAdmins,
  deleteAdminUser,
  getAdminById,
} from "@/lib/admins";
import {
  getMasterAdminUsername,
  requireMasterSession,
} from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMasterSession();
  if (auth.response) return auth.response;

  await ensureAppReady();
  const { id } = await params;
  const adminId = Number(id);

  if (!Number.isFinite(adminId) || adminId <= 0) {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

  const admin = await getAdminById(adminId);
  if (!admin) {
    return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  }

  if (admin.username === getMasterAdminUsername()) {
    return NextResponse.json(
      { error: "Cannot delete the master admin account." },
      { status: 400 }
    );
  }

  if (admin.id === auth.session!.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const total = await countAdmins();
  if (total <= 1) {
    return NextResponse.json(
      { error: "At least one admin account must remain." },
      { status: 400 }
    );
  }

  const deleted = await deleteAdminUser(adminId);
  if (!deleted) {
    return NextResponse.json({ error: "Failed to delete admin." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
