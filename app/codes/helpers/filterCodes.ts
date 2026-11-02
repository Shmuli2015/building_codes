import type { BuildingCodeRow } from "@/lib/building-codes";
import { normalizeText } from "@/lib/normalize";
import type { CodeFilterState, FilterOptions } from "../types";

export function extractFilterOptions<T extends BuildingCodeRow>(rows: T[]): FilterOptions {
  const areaSet = new Set<string>();
  const kindSet = new Set<string>();

  for (const row of rows) {
    if (row.area && row.area.trim()) {
      areaSet.add(row.area.trim());
    }
    if (row.kind && row.kind.trim()) {
      kindSet.add(row.kind.trim());
    }
  }

  return {
    areas: Array.from(areaSet).sort((a, b) => a.localeCompare(b, "he")),
    kinds: Array.from(kindSet).sort((a, b) => a.localeCompare(b, "he")),
  };
}

export function filterAndSortCodes<T extends BuildingCodeRow>(
  rows: T[],
  filters: CodeFilterState,
): T[] {
  const normalizedQuery = normalizeText(filters.searchQuery.trim());

  const filtered = rows.filter((row) => {
    if (filters.selectedArea && row.area.trim() !== filters.selectedArea) {
      return false;
    }

    if (filters.selectedKind && row.kind.trim() !== filters.selectedKind) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const combined = [
      row.street,
      row.number,
      row.area,
      row.code,
      row.kind,
      row.note,
    ].join(" ");

    return normalizeText(combined).includes(normalizedQuery);
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === "area") {
      const areaDiff = (a.area || "").localeCompare(b.area || "", "he");
      if (areaDiff !== 0) return areaDiff;
    }
    const streetDiff = (a.street || "").localeCompare(b.street || "", "he");
    if (streetDiff !== 0) return streetDiff;
    return (Number(a.number) || 0) - (Number(b.number) || 0);
  });
}
