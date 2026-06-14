import type { BuildingCodeRow } from "./building-codes";

export function normalizeText(s: string): string {
  if (!s) return "";
  return s
    .trim()
    .toLowerCase()
    .replace(/["'״׳]/g, "")
    .replace(/י{2,}/g, "י")
    .replace(/ו{2,}/g, "ו")
    .replace(/\s+/g, " ");
}

const STREET_PREFIXES = [
  "רחוב",
  "ר׳",
  "ר'",
  "רבי",
  "שדרות",
  "שד׳",
  "שד'",
  "דרך",
  "סמטת",
  "כיכר",
  "ככר",
  "מבוא",
  "נתיב",
  "בן",
];

function getCoreName(s: string): string {
  const normalized = normalizeText(s);
  let core = normalized;

  for (const prefix of STREET_PREFIXES) {
    const nPrefix = normalizeText(prefix);
    if (core.startsWith(nPrefix + " ")) {
      core = core.substring(nPrefix.length + 1).trim();
      break;
    }
  }

  return core;
}

export function streetMatches(input: string, rowStreet: string): boolean {
  const a = normalizeText(input);
  const b = normalizeText(rowStreet);
  if (!a || !b) return false;

  if (a === b) return true;

  const aCore = getCoreName(a);
  const bCore = getCoreName(b);

  if (aCore === bCore && aCore.length > 1) return true;

  if (aCore.length >= 2 && bCore.length >= 2) {
    if (aCore.includes(bCore) || bCore.includes(aCore)) {
      return true;
    }
  }

  return false;
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

