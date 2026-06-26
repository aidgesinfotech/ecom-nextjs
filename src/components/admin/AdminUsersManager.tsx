"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Plus, Shield, Trash2, UserPlus } from "lucide-react";
import type { AdminUser } from "@/lib/admins";
import AdminButton from "./AdminButton";
import AdminModal from "./AdminModal";
import AdminToast, { type ToastMessage } from "./AdminToast";
import ConfirmDialog from "./ConfirmDialog";

export default function AdminUsersManager({
  initialAdmins,
  currentAdminId,
}: {
  initialAdmins: AdminUser[];
  currentAdminId: number;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function refreshAdmins() {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fd.get("username"),
          password: fd.get("password"),
          confirmPassword: fd.get("confirmPassword"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      setToast({ type: "success", text: `Admin "${data.admin.username}" created successfully.` });
      setCreateOpen(false);
      await refreshAdmins();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create admin.",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resetTarget) return;

    setResetting(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: fd.get("password"),
          confirmPassword: fd.get("confirmPassword"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setToast({
        type: "success",
        text: `Password updated for "${resetTarget.username}".`,
      });
      setResetTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to reset password.",
      });
    } finally {
      setResetting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);

    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");

      setToast({ type: "success", text: `Admin "${deleteTarget.username}" deleted.` });
      setDeleteTarget(null);
      await refreshAdmins();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete admin.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="admin-toolbar">
        <div>
          <p className="admin-toolbar-sub">
            Master admin can create new admin users and reset any password.
          </p>
        </div>
        <AdminButton onClick={() => setCreateOpen(true)}>
          <Plus size={18} />
          Add Admin User
        </AdminButton>
      </div>

      <div className="admin-card admin-card-table">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <strong>{admin.username}</strong>
                    {admin.id === currentAdminId ? (
                      <span className="admin-tag admin-tag-you">You</span>
                    ) : null}
                  </td>
                  <td>
                    {admin.isMaster ? (
                      <span className="admin-badge confirmed admin-master-badge">
                        <Shield size={12} /> Master
                      </span>
                    ) : (
                      <span className="admin-badge processing">Admin</span>
                    )}
                  </td>
                  <td className="orders-date">
                    {admin.createdAt
                      ? new Date(admin.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <AdminButton
                        variant="outline"
                        onClick={() => setResetTarget(admin)}
                        title="Set new password"
                      >
                        <KeyRound size={16} />
                        Reset Password
                      </AdminButton>
                      {admin.id !== currentAdminId && !admin.isMaster ? (
                        <AdminButton
                          variant="ghost"
                          className="admin-btn-icon admin-btn-icon-danger"
                          loading={deletingId === admin.id}
                          loadingLabel=""
                          onClick={() => setDeleteTarget(admin)}
                          title="Delete admin"
                        >
                          <Trash2 size={16} />
                        </AdminButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title="Add Admin User"
        subtitle="Create a new admin account with dashboard access."
        size="md"
        footer={
          <div className="admin-modal-footer-actions">
            <AdminButton
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              form="create-admin-form"
              loading={creating}
              loadingLabel="Creating..."
            >
              <UserPlus size={16} />
              Create Admin
            </AdminButton>
          </div>
        }
      >
        <form id="create-admin-form" className="admin-form" onSubmit={handleCreate}>
          <div>
            <label htmlFor="new-admin-username">Username</label>
            <input
              id="new-admin-username"
              name="username"
              required
              autoComplete="off"
              placeholder="e.g. store.manager"
              minLength={3}
            />
          </div>
          <div>
            <label htmlFor="new-admin-password">Password</label>
            <input
              id="new-admin-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="new-admin-confirm">Confirm Password</label>
            <input
              id="new-admin-confirm"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Re-enter password"
              minLength={6}
            />
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={!!resetTarget}
        onClose={() => !resetting && setResetTarget(null)}
        title="Reset Password"
        subtitle={
          resetTarget
            ? `Set a new password for "${resetTarget.username}".`
            : undefined
        }
        size="md"
        footer={
          <div className="admin-modal-footer-actions">
            <AdminButton
              variant="outline"
              onClick={() => setResetTarget(null)}
              disabled={resetting}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              form="reset-admin-password-form"
              loading={resetting}
              loadingLabel="Saving..."
            >
              <KeyRound size={16} />
              Update Password
            </AdminButton>
          </div>
        }
      >
        <form
          id="reset-admin-password-form"
          className="admin-form"
          onSubmit={handleResetPassword}
        >
          <div>
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm">Confirm Password</label>
            <input
              id="reset-confirm"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Re-enter password"
              minLength={6}
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin User"
        message={`Delete "${deleteTarget?.username}"? They will no longer be able to log in.`}
        confirmLabel="Delete Admin"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => !deletingId && setDeleteTarget(null)}
      />
    </>
  );
}
