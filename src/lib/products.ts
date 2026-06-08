import { revalidateTag, unstable_cache } from "next/cache";
import pool from "./db";
import type { Product } from "./types";
import { parseImages, parseSizes } from "./format";
import type { RowDataPacket } from "mysql2";

function mapProduct(row: RowDataPacket): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    compare_price: Number(row.compare_price),
    images: parseImages(row.images),
    category: row.category,
    sizes: parseSizes(row.sizes),
    quantity: Number(row.quantity),
    stock_status: row.stock_status,
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM products ORDER BY created_at DESC"
  );
  return rows.map(mapProduct);
}

async function fetchProductById(id: string): Promise<Product | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
}

const getProductsCached = unstable_cache(fetchProducts, ["products-list"], {
  revalidate: 60,
  tags: ["products"],
});

const getProductByIdCached = (id: string) =>
  unstable_cache(() => fetchProductById(id), ["product", id], {
    revalidate: 60,
    tags: ["products", `product-${id}`],
  })();

export async function getProducts(options?: { fresh?: boolean }): Promise<Product[]> {
  if (options?.fresh) return fetchProducts();
  return getProductsCached();
}

export async function getProductById(
  id: string,
  options?: { fresh?: boolean }
): Promise<Product | null> {
  if (options?.fresh) return fetchProductById(id);
  return getProductByIdCached(id);
}

export function revalidateProductsCache() {
  revalidateTag("products", { expire: 0 });
}
