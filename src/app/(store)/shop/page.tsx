import CatalogClient from "@/components/CatalogClient";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function ShopPage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Shop: failed to load products.", err);
  }

  return (
    <CatalogClient
      products={products}
      title="Shop"
      breadcrumb="Home > Shop"
    />
  );
}
