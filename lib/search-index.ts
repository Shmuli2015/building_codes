import type { BuildingCodeRow } from "./building-codes";
import { filterRows, streetMatches } from "./normalize";

export type SearchIndex = {
  streets: string[];
  areas: string[];
  numbersByStreet: Record<string, string[]>;
};

function sortNumbers(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, "he");
}

function sortHebrew(a: string, b: string): number {
  return a.localeCompare(b, "he");
}

export function buildSearchIndex(rows: BuildingCodeRow[]): SearchIndex {
  const streetSet = new Set<string>();
  const areaSet = new Set<string>();
  const numbersMap = new Map<string, Set<string>>();

  for (const row of rows) {
    if (row.street) {
      streetSet.add(row.street);
      if (row.number) {
        let nums = numbersMap.get(row.street);
        if (!nums) {
          nums = new Set();
          numbersMap.set(row.street, nums);
        }
        nums.add(row.number);
      }
    }
    if (row.area) {
      areaSet.add(row.area);
    }
  }

  const numbersByStreet: Record<string, string[]> = {};
  for (const [street, nums] of numbersMap) {
    numbersByStreet[street] = Array.from(nums).sort(sortNumbers);
  }

  return {
    streets: Array.from(streetSet).sort(sortHebrew),
    areas: Array.from(areaSet).sort(sortHebrew),
    numbersByStreet,
  };
}

export function getHouseNumbersForStreet(
  index: SearchIndex,
  streetInput: string,
): string[] {
  if (!streetInput.trim()) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const [street, numbers] of Object.entries(index.numbersByStreet)) {
    if (!streetMatches(streetInput, street)) continue;
    for (const number of numbers) {
      if (!seen.has(number)) {
        seen.add(number);
        result.push(number);
      }
    }
  }

  return result.sort(sortNumbers);
}

export function filterRowsWithIndex(
  rows: BuildingCodeRow[],
  index: SearchIndex,
  street: string,
  number: string,
  area?: string,
): BuildingCodeRow[] {
  if (!street.trim() || !number.trim()) return [];

  const matchingStreets = new Set<string>();
  for (const s of index.streets) {
    if (streetMatches(street, s)) {
      matchingStreets.add(s);
    }
  }

  if (matchingStreets.size === 0) return [];

  const candidates = rows.filter((row) => matchingStreets.has(row.street));
  return filterRows(candidates, street, number, area);
}

export const DATALIST_LIMIT = 50;
export const DATALIST_EMPTY_LIMIT = 30;

export function capDatalistOptions(
  items: string[],
  input: string,
  limit = DATALIST_LIMIT,
): string[] {
  const trimmed = input.trim();
  if (!trimmed) {
    return items.slice(0, DATALIST_EMPTY_LIMIT);
  }

  const lower = trimmed.toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.toLowerCase().includes(lower) ||
      item.includes(trimmed),
  );

  return filtered.slice(0, limit);
}
