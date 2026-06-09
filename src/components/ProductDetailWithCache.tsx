"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { cacheProduct } from "@/lib/product-cache";
import ProductDetail from "@/components/ProductDetail";

export default function ProductDetailWithCache({ product }: { product: Product }) {
  useEffect(() => {
    cacheProduct(product);
  }, [product]);

  return <ProductDetail product={product} />;
}
