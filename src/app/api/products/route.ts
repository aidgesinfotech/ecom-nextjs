import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureAppReady } from "@/lib/db-init";
import { getProducts, revalidateProductsCache } from "@/lib/products";
import { getAdminSession } from "@/lib/auth";
import { normalizeSizeOptions } from "@/lib/format";

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

  await ensureAppReady();
  const body = await req.json();
  const id = body.id || crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  const sizes = normalizeSizeOptions(
    body.sizes || [
      { label: "28", sku: "" },
      { label: "30", sku: "" },
      { label: "32", sku: "" },
      { label: "34", sku: "" },
      { label: "36", sku: "" },
      { label: "38", sku: "" },
      { label: "40", sku: "" },
    ]
  );

  await pool.query(
    `INSERT INTO products (id, name, description, price, compare_price, images, category, sku, sizes, quantity, stock_status, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.name,
      body.description || "",
      body.price,
      body.compare_price || 0,
      JSON.stringify(body.images || []),
      body.category || "Bottom Wear",
      body.sku ? String(body.sku).trim() : null,
      JSON.stringify(sizes),
      body.quantity || 999,
      body.stock_status || "In Stock",
      body.featured ? 1 : 0,
    ]
  );

  revalidateProductsCache();
  return NextResponse.json({ id });
}
