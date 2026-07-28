import bcrypt from "bcryptjs";
import pool from "./db";
import type { RowDataPacket } from "mysql2";

export interface AdminRecord {
  id: number;
  username: string;
  created_at: string;
}

function mapAdmin(row: RowDataPacket): AdminRecord {
  return {
    id: Number(row.id),
    username: String(row.username),
    created_at: String(row.created_at),
  };
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, username, created_at FROM admins ORDER BY created_at ASC"
  );
  return rows.map(mapAdmin);
}

export async function getAdminById(id: number): Promise<AdminRecord | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, username, created_at FROM admins WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapAdmin(rows[0]) : null;
}

export async function createAdminUser(
  username: string,
  password: string
): Promise<AdminRecord> {
  const normalized = username.trim();
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
    [normalized, hash]
  );
  const insertId = (result as { insertId: number }).insertId;
  const admin = await getAdminById(insertId);
  if (!admin) {
    throw new Error("Failed to create admin user");
  }
  return admin;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const [result] = await pool.query("DELETE FROM admins WHERE id = ?", [id]);
  return Number((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
}

export async function countAdmins(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM admins"
  );
  return Number(rows[0]?.c ?? 0);
}
