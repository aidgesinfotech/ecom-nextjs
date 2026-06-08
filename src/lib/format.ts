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

export function parseSizes(raw: unknown): string[] {
  return parseImages(raw);
}
