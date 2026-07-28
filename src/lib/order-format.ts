export function formatOrderNumber(
  id: number,
  createdAt: string | Date,
  orderNumber?: string | null
) {
  if (orderNumber) return orderNumber;
  const ts = new Date(createdAt).getTime();
  return `ORD-${id}${String(ts).slice(-10)}`;
}
