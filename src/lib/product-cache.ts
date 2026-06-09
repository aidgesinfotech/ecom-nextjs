import type { Product } from "./types";

const CACHE_KEY = "aikvis_product_cache";

type ProductCacheMap = Record<string, Product>;

function readMap(): ProductCacheMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProductCacheMap;
  } catch {
    return {};
  }
}

function writeMap(map: ProductCacheMap) {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(map);
    const trimmed =
      keys.length > 24
        ? Object.fromEntries(keys.slice(-24).map((k) => [k, map[k]]))
        : map;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota / private mode */
  }
}

export function cacheProduct(product: Product) {
  const map = readMap();
  map[product.id] = product;
  writeMap(map);
}

export function getCachedProduct(id: string): Product | null {
  return readMap()[id] ?? null;
}
