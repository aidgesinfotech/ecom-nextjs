import ProductDetail from "@/components/ProductDetail";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
