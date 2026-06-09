"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductGrid from "./ProductGrid";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export default function CatalogClient({
  products,
  title = "Shop",
  breadcrumb = "Home > Shop",
  featuredOnly = false,
}: {
  products: Product[];
  title?: string;
  breadcrumb?: string;
  featuredOnly?: boolean;
}) {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [outStock, setOutStock] = useState(true);
  const [maxPrice, setMaxPrice] = useState(5000);

  const filtered = useMemo(() => {
    let list = (featuredOnly ? products.filter((p) => p.featured) : products).filter((p) => {
      if (searchQuery) {
        const haystack = `${p.name} ${p.description || ""} ${p.category || ""}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      const isInStock = p.stock_status === "In Stock";
      if (isInStock && !inStock) return false;
      if (!isInStock && !outStock) return false;
      if (p.price > maxPrice) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list = [...list].sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
      default:
        break;
    }
    return list;
  }, [products, sortBy, inStock, outStock, maxPrice, featuredOnly, searchQuery]);

  const inStockCount = products.filter((p) => p.stock_status === "In Stock").length;
  const outStockCount = products.length - inStockCount;

  return (
    <div className="catalog-page container section-padding">
      <div className="breadcrumb">{breadcrumb.replace(/ > /g, " \u203a ")}</div>

      <button
        className="mobile-filter-toggle"
        type="button"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="filter-icon">⚙</span> Filters
      </button>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="catalog-layout">
        <aside className={`catalog-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header show-mobile">
            <h3>Filters</h3>
            <button className="close-sidebar" type="button" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>
          </div>

          <div className="filter-group show-mobile">
            <h3 className="filter-title">Sort By</h3>
            <div className="filter-options-list">
              {[
                ["featured", "Featured"],
                ["price-asc", "Price: Low to High"],
                ["price-desc", "Price: High to Low"],
                ["newest", "Newest"],
              ].map(([val, label]) => (
                <label key={val} className="filter-option sort-option">
                  <input
                    type="radio"
                    name="sortByMobile"
                    checked={sortBy === val}
                    onChange={() => setSortBy(val as SortOption)}
                  />{" "}
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Availability</h3>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />{" "}
              In stock ({inStockCount})
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={outStock}
                onChange={(e) => setOutStock(e.target.checked)}
              />{" "}
              Out of stock ({outStockCount})
            </label>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Price</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2">
                <span>₹0</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="catalog-main">
          <div className="catalog-header flex justify-between items-center mb-4">
            <h1 className="page-title">
              {title} <span className="count">{filtered.length}</span>
            </h1>
            <div className="sorting flex gap-4 items-center hide-mobile">
              <span>Sort by:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <ProductGrid products={filtered} />
        </main>
      </div>
    </div>
  );
}
