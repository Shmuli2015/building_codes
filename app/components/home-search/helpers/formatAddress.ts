export function formatAddress(
  street: string,
  houseNumber: string,
  area?: string,
): string {
  const base = `${street} ${houseNumber}`;
  return area?.trim() ? `${area.trim()} · ${base}` : base;
}
