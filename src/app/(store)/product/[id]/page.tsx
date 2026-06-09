import ProductDetailWithCache from "@/components/ProductDetailWithCache";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product = null;
  try {
    product = await getProductById(id);
  } catch (err) {
    console.error("Product page: failed to load product.", err);
  }
  if (!product) notFound();
  return <ProductDetailWithCache product={product} />;
}
