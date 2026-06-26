import bcrypt from "bcryptjs";
import pool from "./db";
import type { RowDataPacket } from "mysql2";

export type AdminUser = {
  id: number;
  username: string;
  isMaster: boolean;
  createdAt: string;
};

function mapAdmin(row: RowDataPacket): AdminUser {
  return {
    id: Number(row.id),
    username: String(row.username),
    isMaster: Boolean(row.is_master),
    createdAt: row.created_at ? String(row.created_at) : "",
  };
}

export async function listAdmins(): Promise<AdminUser[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, username, is_master, created_at FROM admins ORDER BY is_master DESC, username ASC"
  );
  return rows.map(mapAdmin);
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, username, is_master, created_at FROM admins WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapAdmin(rows[0]) : null;
}

export async function getAdminIsMaster(id: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT is_master FROM admins WHERE id = ? LIMIT 1",
    [id]
  );
  return Boolean(rows[0]?.is_master);
}

export async function createAdminUser(username: string, password: string): Promise<AdminUser> {
  const normalized = username.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO admins (username, password_hash, is_master) VALUES (?, ?, 0)",
    [normalized, hash]
  );
  const insertId = Number((result as { insertId: number }).insertId);
  const created = await getAdminById(insertId);
  if (!created) throw new Error("Failed to create admin user");
  return created;
}

export async function updateAdminPassword(id: number, password: string): Promise<void> {
  const hash = await bcrypt.hash(password, 10);
  await pool.query("UPDATE admins SET password_hash = ? WHERE id = ?", [hash, id]);
}

export async function deleteAdminUser(id: number): Promise<void> {
  await pool.query("DELETE FROM admins WHERE id = ?", [id]);
}

export async function countMasterAdmins(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM admins WHERE is_master = 1"
  );
  return Number(rows[0]?.count ?? 0);
}
