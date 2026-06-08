export function formatOrderNumber(id: number, createdAt: string | Date) {
  const ts = new Date(createdAt).getTime();
  return `ORD-${id}${String(ts).slice(-10)}`;
}
