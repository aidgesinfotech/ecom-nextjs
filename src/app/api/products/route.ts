import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAppReady } from "@/lib/db-init";
import { getProducts, revalidateProductsCache } from "@/lib/products";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    await ensureAppReady();
    const products = await getProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = body.id || crypto.randomUUID().replace(/-/g, "").slice(0, 24);

  await pool.query(
    `INSERT INTO products (id, name, description, price, compare_price, images, category, sizes, quantity, stock_status, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.name,
      body.description || "",
      body.price,
      body.compare_price || 0,
      JSON.stringify(body.images || []),
      body.category || "Bottom Wear",
      JSON.stringify(body.sizes || ["28", "30", "32", "34", "36", "38", "40"]),
      body.quantity || 999,
      body.stock_status || "In Stock",
      body.featured ? 1 : 0,
    ]
  );

  revalidateProductsCache();
  return NextResponse.json({ id });
}
