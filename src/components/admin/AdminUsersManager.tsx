"use client";

import { FormEvent, useState } from "react";
import { Plus, Shield, Trash2, User } from "lucide-react";
import AdminButton from "./AdminButton";
import AdminToast, { type ToastMessage } from "./AdminToast";
import ConfirmDialog from "./ConfirmDialog";

export interface AdminUserRow {
  id: number;
  username: string;
  created_at: string;
  isMaster: boolean;
}

export default function AdminUsersManager({
  initialAdmins,
  currentUserId,
}: {
  initialAdmins: AdminUserRow[];
  currentUserId: number;
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setAdmins(data.admins || []);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin user.");
      }
      setToast({ type: "success", text: "Admin user created." });
      setUsername("");
      setPassword("");
      await refresh();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create admin user.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete admin user.");
      }
      setToast({ type: "success", text: "Admin user deleted." });
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete admin user.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="admin-card admin-users-form-card">
        <div className="admin-users-form-head">
          <div>
            <h2>Add Admin User</h2>
            <p>Create another admin login for your team.</p>
          </div>
          <Shield size={22} />
        </div>
        <form className="admin-form admin-users-form" onSubmit={onSubmit}>
          <div>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. support"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>
          <AdminButton type="submit" loading={saving} loadingLabel="Adding...">
            <Plus size={16} />
            Add Admin
          </AdminButton>
        </form>
      </div>

      <div className="admin-card admin-card-table">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Created</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="admin-empty-state">
                      <p>No admin users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="orders-avatar">
                          <User size={16} />
                        </span>
                        <strong>{admin.username}</strong>
                      </div>
                    </td>
                    <td>
                      {new Date(admin.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          admin.isMaster ? "confirmed" : "processing"
                        }`}
                      >
                        {admin.isMaster ? "Master" : "Admin"}
                      </span>
                    </td>
                    <td>
                      <AdminButton
                        variant="ghost"
                        className="admin-btn-icon admin-btn-icon-danger"
                        disabled={admin.isMaster || admin.id === currentUserId}
                        loading={deletingId === admin.id}
                        loadingLabel=""
                        onClick={() => setDeleteTarget(admin)}
                        title={
                          admin.isMaster
                            ? "Cannot delete master admin"
                            : admin.id === currentUserId
                              ? "Cannot delete your own account"
                              : "Delete admin"
                        }
                      >
                        <Trash2 size={16} />
                      </AdminButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin User"
        message={`Delete admin "${deleteTarget?.username}"? This cannot be undone.`}
        confirmLabel="Delete Admin"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => !deletingId && setDeleteTarget(null)}
      />
    </>
  );
}
