import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";
import { getUnsyncedOrders } from "@/lib/order-queries";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAppReady();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  try {
    const result = await getUnsyncedOrders(page, limit);
    return NextResponse.json({
      success: true,
      data: result.orders,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error("[Unsynced orders]", err);
    return NextResponse.json({ error: "Failed to load unsynced orders" }, { status: 500 });
  }
}
