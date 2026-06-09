"use client";

import { useParams } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";
import { getCachedProduct } from "@/lib/product-cache";

export default function ProductLoading() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const cached = id ? getCachedProduct(id) : null;

  if (cached) {
    return <ProductDetail product={cached} />;
  }

  return <ProductDetailSkeleton />;
}
