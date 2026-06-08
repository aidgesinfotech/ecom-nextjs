import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";
import { getOrderSummaryStats, getOrdersPaginated } from "@/lib/order-queries";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAppReady();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const status = searchParams.get("status") || "all";
  const payment = searchParams.get("payment") || "all";
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const [summary, list] = await Promise.all([
    getOrderSummaryStats(),
    getOrdersPaginated({ page, limit, status, payment, search, dateFrom, dateTo }),
  ]);

  return NextResponse.json({ summary, ...list });
}
