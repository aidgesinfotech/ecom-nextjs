import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getProductById, revalidateProductsCache } from "@/lib/products";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await pool.query(
    `UPDATE products SET name=?, description=?, price=?, compare_price=?, images=?, category=?, sizes=?, quantity=?, stock_status=?, featured=? WHERE id=?`,
    [
      body.name,
      body.description || "",
      body.price,
      body.compare_price || 0,
      JSON.stringify(body.images || []),
      body.category || "Bottom Wear",
      JSON.stringify(body.sizes || []),
      body.quantity || 0,
      body.stock_status || "In Stock",
      body.featured ? 1 : 0,
      id,
    ]
  );

  revalidateProductsCache();
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
  revalidateProductsCache();
  return NextResponse.json({ success: true });
}
