import pool from "./db";
import { getDateRange, toMysqlDatetime, type DatePeriod } from "./date-range";
import type { RowDataPacket } from "mysql2";

export interface OrderRow {
  id: number;
  order_number: string | null;
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  total: number;
  status: string;
  resolved_sku: string | null;
  shipeaso_response: string | null;
  created_at: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  confirmedCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

export function mapOrderRow(row: RowDataPacket): OrderRow {
  return {
    id: row.id,
    order_number: row.order_number ? String(row.order_number) : null,
    product_id: row.product_id,
    product_name: row.product_name,
    size: row.size,
    quantity: Number(row.quantity),
    customer_name: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    payment_method: row.payment_method,
    total: Number(row.total),
    status: row.status,
    resolved_sku: row.resolved_sku ? String(row.resolved_sku) : null,
    shipeaso_response: row.shipeaso_response
      ? String(row.shipeaso_response)
      : null,
    created_at: row.created_at,
  };
}

export async function getOrderById(id: number): Promise<OrderRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapOrderRow(rows[0]) : null;
}

export async function saveShipeasoResponse(
  orderId: number,
  responseJson: string,
  resolvedSku?: string | null
): Promise<void> {
  if (resolvedSku !== undefined) {
    await pool.query(
      "UPDATE orders SET shipeaso_response = ?, resolved_sku = ? WHERE id = ?",
      [responseJson, resolvedSku, orderId]
    );
  } else {
    await pool.query(
      "UPDATE orders SET shipeaso_response = ? WHERE id = ?",
      [responseJson, orderId]
    );
  }
}

export async function getOrdersInRange(
  period: DatePeriod,
  customFrom?: string,
  customTo?: string
): Promise<{ orders: OrderRow[]; stats: OrderStats; rangeLabel: string }> {
  const range = getDateRange(period, customFrom, customTo);
  const from = toMysqlDatetime(range.from);
  const to = toMysqlDatetime(range.to);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM orders
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY created_at DESC`,
    [from, to]
  );

  const orders = rows.map(mapOrderRow);

  const stats: OrderStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + o.total, 0),
    pendingCount: orders.filter((o) => o.status === "pending").length,
    confirmedCount: orders.filter((o) => o.status === "confirmed").length,
    deliveredCount: orders.filter((o) => o.status === "delivered").length,
    cancelledCount: orders.filter((o) => o.status === "cancelled").length,
  };

  return { orders, stats, rangeLabel: range.label };
}

export async function getAllTimeStats(): Promise<{
  productCount: number;
  totalOrders: number;
  pendingOrders: number;
}> {
  const [productRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM products"
  );
  const [orderRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM orders"
  );
  const [pendingRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM orders WHERE status = 'pending'"
  );

  return {
    productCount: Number(productRows[0]?.c ?? 0),
    totalOrders: Number(orderRows[0]?.c ?? 0),
    pendingOrders: Number(pendingRows[0]?.c ?? 0),
  };
}
