import type { CodeWithIndex } from "@/lib/sheet-actions";
import { normalizeHouseNumber, normalizeText } from "@/lib/normalize";
import type { GroupedAddress } from "../types";

export function groupCodesByAddress(rows: CodeWithIndex[]): GroupedAddress[] {
  const groups: GroupedAddress[] = [];

  for (const row of rows) {
    const normStreet = normalizeText(row.street);
    const normNumber = normalizeHouseNumber(row.number);
    const normArea = normalizeText(row.area);

    let match: GroupedAddress | undefined;
    for (const group of groups) {
      if (
        normalizeText(group.street) === normStreet &&
        normalizeHouseNumber(group.number) === normNumber
      ) {
        const groupNormArea = normalizeText(group.area);
        if (!normArea || !groupNormArea || normArea === groupNormArea) {
          match = group;
          break;
        }
      }
    }

    if (match) {
      match.codes.push(row);
      if (!match.area && row.area) {
        match.area = row.area;
      }
    } else {
      groups.push({
        key: `${normStreet}|${normNumber}|${normArea}`,
        street: row.street,
        number: row.number,
        area: row.area,
        codes: [row],
      });
    }
  }

  return groups;
}

export function getCodeFallbackLabel(
  index: number,
  totalInGroup: number,
): string | null {
  if (totalInGroup <= 1) {
    return null;
  }
  if (index === 0) {
    return "קוד 1";
  }
  if (index === 1) {
    return "קוד חלופי";
  }
  return `קוד ${index + 1}`;
}

