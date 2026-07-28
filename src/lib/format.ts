import type { SizeOption } from "./types";

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}.00`;
}

export function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Parse sizes JSON — supports legacy string[] and SizeOption[]. */
export function parseSizes(raw: unknown): SizeOption[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      return [];
    }
  }

  return arr
    .map((item): SizeOption | null => {
      if (typeof item === "string") {
        const label = item.trim();
        return label ? { label, sku: "" } : null;
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const label = String(obj.label ?? obj.value ?? obj.size ?? "").trim();
        if (!label) return null;
        return { label, sku: String(obj.sku ?? "").trim() };
      }
      return null;
    })
    .filter((s): s is SizeOption => s !== null);
}

export function sizeLabels(sizes: SizeOption[]): string[] {
  return sizes.map((s) => s.label);
}

export function normalizeSizeOptions(raw: unknown): SizeOption[] {
  if (!Array.isArray(raw)) return [];
  return parseSizes(raw);
}
