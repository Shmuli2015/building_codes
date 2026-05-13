import type { BuildingCodeRow } from "./building-codes";

export function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function streetMatches(input: string, rowStreet: string): boolean {
  const a = normalizeText(input);
  const b = normalizeText(rowStreet);
  if (!a || !b) return false;
  return a === b;
}

export function normalizeHouseNumber(s: string): string {
  const trimmed = s.trim();
  const stripped = trimmed.replace(/[^\p{L}\p{N}]/gu, "");
  const noLeadingZeros = stripped.replace(/^0+/, "");
  return noLeadingZeros || trimmed;
}

export function numberMatches(input: string, rowNumber: string): boolean {
  const a = normalizeHouseNumber(input);
  const b = normalizeHouseNumber(rowNumber);
  if (!a || !b) return false;
  return a === b;
}

export function rowMatchesQuery(
  row: BuildingCodeRow,
  street: string,
  number: string,
  area?: string,
): boolean {
  if (!streetMatches(street, row.street)) return false;
  if (!numberMatches(number, row.number)) return false;
  if (area && area.trim()) {
    if (!streetMatches(area, row.area)) return false;
  }
  return true;
}

export function filterRows(
  rows: BuildingCodeRow[],
  street: string,
  number: string,
  area?: string,
): BuildingCodeRow[] {
  return rows.filter((r) => rowMatchesQuery(r, street, number, area));
}
