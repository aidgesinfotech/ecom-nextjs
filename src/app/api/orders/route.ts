import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";
import { getAllTimeStats, getOrdersInRange } from "@/lib/orders";
import { sendMetaPurchaseEvent } from "@/lib/meta-capi";
import type { DatePeriod } from "@/lib/date-range";

const VALID_PERIODS: DatePeriod[] = [
  "today",
  "yesterday",
  "last3",
  "last7",
  "last15",
  "lastMonth",
  "custom",
];

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAppReady();

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "today") as DatePeriod;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  if (period === "custom" && (!from || !to)) {
    return NextResponse.json(
      { error: "Custom range requires from and to dates" },
      { status: 400 }
    );
  }

  const { orders, stats, rangeLabel } = await getOrdersInRange(period, from, to);
  const allTime = await getAllTimeStats();

  return NextResponse.json({
    orders,
    stats,
    rangeLabel,
    period,
    allTime,
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureAppReady();
    const body = await req.json();

    const required = [
      "product_id",
      "product_name",
      "customer_name",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
      "total",
    ] as const;

    for (const key of required) {
      if (!body[key] && body[key] !== 0) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    if (!/^[0-9]{10}$/.test(String(body.phone))) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!/^[0-9]{6}$/.test(String(body.pincode))) {
      return NextResponse.json({ error: "Please enter a valid 6 digit pincode." }, { status: 400 });
    }

    const streetAddress = String(body.address).trim();
    const landmark = body.landmark ? String(body.landmark).trim() : "";

    if (streetAddress.length < 14) {
      return NextResponse.json(
        { error: "Please enter a complete address (minimum 14 characters)." },
        { status: 400 }
      );
    }

    if (landmark && landmark.length < 4) {
      return NextResponse.json(
        { error: "Landmark must be at least 4 characters if provided." },
        { status: 400 }
      );
    }

    const fullAddress = landmark ? `${streetAddress}, ${landmark}` : streetAddress;

    const [productRows] = await pool.query(
      "SELECT id, stock_status FROM products WHERE id = ? LIMIT 1",
      [body.product_id]
    );
    const product = (productRows as { id: string; stock_status: string }[])[0];
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.stock_status === "Out of Stock") {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO orders (product_id, product_name, size, quantity, customer_name, phone, email, address, city, state, pincode, payment_method, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        body.product_id,
        body.product_name,
        body.size || "—",
        body.quantity || 1,
        String(body.customer_name).trim(),
        String(body.phone),
        body.email || null,
        fullAddress,
        String(body.city).trim(),
        String(body.state).trim(),
        String(body.pincode),
        body.payment_method || "COD",
        Number(body.total),
      ]
    );

    const insertId = (result as { insertId: number }).insertId;

    void sendMetaPurchaseEvent({
      orderId: insertId,
      total: Number(body.total),
      customerName: String(body.customer_name).trim(),
      phone: String(body.phone),
      email: body.email || null,
      productName: String(body.product_name),
    });

    return NextResponse.json({ success: true, order_id: insertId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
