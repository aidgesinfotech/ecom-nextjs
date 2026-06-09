"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import ProductGrid from "./ProductGrid";

export default function HomeProducts({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setProducts(data as Product[]);
        }
      } catch {
        /* keep server-provided products if fetch fails */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && products.length === 0) {
    return (
      <p className="text-center" style={{ color: "#64748b", padding: "3rem 0" }}>
        Loading products...
      </p>
    );
  }

  return <ProductGrid products={products} />;
}
