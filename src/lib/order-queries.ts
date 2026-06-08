import pool from "./db";
import { getDateRange, toMysqlDatetime, type DatePeriod } from "./date-range";
import type { OrderRow } from "./orders";
import type { RowDataPacket } from "mysql2";

export { formatOrderNumber } from "./order-format";

function mapOrder(row: RowDataPacket): OrderRow {
  return {
    id: row.id,
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
    created_at: row.created_at,
  };
}

export interface OrderSummaryStats {
  today: number;
  yesterday: number;
  last7: number;
  thisMonth: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
}

export interface OrdersListResult {
  orders: OrderRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function countInPeriod(period: DatePeriod): Promise<number> {
  const range = getDateRange(period);
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as c FROM orders WHERE created_at >= ? AND created_at <= ?",
    [toMysqlDatetime(range.from), toMysqlDatetime(range.to)]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function getOrderSummaryStats(): Promise<OrderSummaryStats> {
  const [today, yesterday, last7, thisMonth] = await Promise.all([
    countInPeriod("today"),
    countInPeriod("yesterday"),
    countInPeriod("last7"),
    countInPeriod("lastMonth"),
  ]);

  const [revenueRows] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'"
  );

  const [statusRows] = await pool.query<RowDataPacket[]>(
    "SELECT status, COUNT(*) as c FROM orders GROUP BY status"
  );

  const byStatus: Record<string, number> = {
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const row of statusRows) {
    const s = String(row.status).toLowerCase();
    byStatus[s] = Number(row.c);
    byStatus.all += Number(row.c);
  }

  return {
    today,
    yesterday,
    last7,
    thisMonth,
    totalRevenue: Number(revenueRows[0]?.revenue ?? 0),
    byStatus,
  };
}

export interface OrderListFilters {
  page?: number;
  limit?: number;
  status?: string;
  payment?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getOrdersPaginated(
  filters: OrderListFilters
): Promise<OrdersListResult> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(10, filters.limit || 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = ["1=1"];
  const params: (string | number)[] = [];

  if (filters.status && filters.status !== "all") {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.payment && filters.payment !== "all") {
    conditions.push("UPPER(payment_method) = ?");
    params.push(filters.payment.toUpperCase());
  }

  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      `(CAST(id AS CHAR) LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR product_name LIKE ?)`
    );
    params.push(q, q, q, q);
  }

  if (filters.dateFrom) {
    const from = toMysqlDatetime(
      new Date(filters.dateFrom + "T00:00:00+05:30")
    );
    conditions.push("created_at >= ?");
    params.push(from);
  }

  if (filters.dateTo) {
    const to = toMysqlDatetime(new Date(filters.dateTo + "T23:59:59+05:30"));
    conditions.push("created_at <= ?");
    params.push(to);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as c FROM orders WHERE ${where}`,
    params
  );
  const total = Number(countRows[0]?.c ?? 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM orders WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    orders: rows.map(mapOrder),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getAllOrdersForExport(
  filters: Omit<OrderListFilters, "page" | "limit">
): Promise<OrderRow[]> {
  const result = await getOrdersPaginated({ ...filters, page: 1, limit: 10000 });
  return result.orders;
}
