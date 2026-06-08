import CatalogClient from "@/components/CatalogClient";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export default async function CatalogPage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Catalog: failed to load products.", err);
  }
  return <CatalogClient products={products} />;
}
