export type ShipeasoSyncStatus = "pending" | "added" | "failed";

export function parseShipeasoResponse(raw: string | null | undefined): {
  request?: unknown;
  response?: unknown;
  error?: unknown;
} | null {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as object);
  } catch {
    return null;
  }
}

export function isShipeasoSuccess(raw: string | null | undefined): boolean {
  const d = parseShipeasoResponse(raw);
  if (!d) return false;
  if (d.error) return false;
  const r = (d.response || d) as Record<string, unknown>;
  if (!r || typeof r !== "object") return false;
  if (r.status === true || r.success === true) return true;
  if (r.order_id || r.id) return true;
  if (
    typeof r.message === "string" &&
    r.message.toLowerCase().includes("success")
  ) {
    return true;
  }
  return false;
}

export function getShipeasoSyncStatus(
  raw: string | null | undefined
): ShipeasoSyncStatus {
  if (!raw || !String(raw).trim()) return "pending";
  return isShipeasoSuccess(raw) ? "added" : "failed";
}
