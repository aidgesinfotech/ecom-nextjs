import { Suspense } from "react";
import CatalogClient from "@/components/CatalogClient";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function BestSellersPage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Best Sellers: failed to load products.", err);
  }

  return (
    <Suspense fallback={null}>
      <CatalogClient
        products={products}
        title="Best Sellers"
        breadcrumb="Home > Best Sellers"
        featuredOnly
      />
    </Suspense>
  );
}
