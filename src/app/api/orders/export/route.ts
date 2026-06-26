import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";
import { formatOrderNumber, getAllOrdersForExport, getOrdersPaginated } from "@/lib/order-queries";

export const maxDuration = 60;

function escapeCsv(val: string | number | null | undefined) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAppReady();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const payment = searchParams.get("payment") || "all";
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const scope = searchParams.get("scope") || "all";
  const filters = { status, payment, search, dateFrom, dateTo };

  const orders =
    scope === "page"
      ? (
          await getOrdersPaginated({
            ...filters,
            page: Number(searchParams.get("page") || 1),
            limit: Number(searchParams.get("limit") || 20),
          })
        ).orders
      : await getAllOrdersForExport(filters);

  const headers = [
    "Order #",
    "Order ID",
    "Customer Name",
    "Phone",
    "Email",
    "Product",
    "Size",
    "Quantity",
    "Address",
    "City",
    "State",
    "Pincode",
    "Payment Method",
    "Total",
    "Status",
    "Order Date",
  ];

  const rows = orders.map((o) =>
    [
      formatOrderNumber(o.id, o.created_at),
      o.id,
      o.customer_name,
      o.phone,
      o.email || "",
      o.product_name,
      o.size,
      o.quantity,
      o.address,
      o.city,
      o.state,
      o.pincode,
      o.payment_method,
      o.total,
      o.status,
      new Date(o.created_at).toLocaleString("en-IN"),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const suffix =
    scope === "page"
      ? `page-${searchParams.get("page") || 1}`
      : `all-${orders.length}`;
  const filename = `orders-export-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
