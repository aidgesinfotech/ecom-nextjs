import CatalogClient from "@/components/CatalogClient";
import { getProducts } from "@/lib/products";

export const revalidate = 60;

export default async function CatalogPage() {
  const products = await getProducts();
  return <CatalogClient products={products} />;
}
