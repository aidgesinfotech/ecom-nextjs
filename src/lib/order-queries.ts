import pool from "./db";
import { getDateRange, toMysqlDatetime, type DatePeriod } from "./date-range";
import { mapOrderRow, type OrderRow } from "./orders";
import type { RowDataPacket } from "mysql2";

export { formatOrderNumber } from "./order-format";

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
      `(CAST(id AS CHAR) LIKE ? OR order_number LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR product_name LIKE ?)`
    );
    params.push(q, q, q, q, q);
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
    orders: rows.map(mapOrderRow),
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

const UNSYNCED_WHERE = `
  status NOT IN ('cancelled')
  AND (
    shipeaso_response IS NULL
    OR shipeaso_response = ''
    OR JSON_UNQUOTE(JSON_EXTRACT(shipeaso_response, '$.error')) IS NOT NULL
  )
`;

export async function getUnsyncedOrders(
  page = 1,
  limit = 20
): Promise<OrdersListResult> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(5000, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as c FROM orders WHERE ${UNSYNCED_WHERE}`
  );
  const total = Number(countRows[0]?.c ?? 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM orders WHERE ${UNSYNCED_WHERE}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [safeLimit, offset]
  );

  return {
    orders: rows.map(mapOrderRow),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}
