export type BuildingCodeRow = {
  area: string;
  street: string;
  number: string;
  code: string;
  kind: string;
  note: string;
};

export type ParsedSheetResult = {
  rows: BuildingCodeRow[];
  warnings: string[];
};

const HEADER_TO_FIELD: Record<string, keyof BuildingCodeRow> = {
  area: "area",
  שכונה: "area",
  אזור: "area",
  street: "street",
  רחוב: "street",
  כתובת: "street",
  number: "number",
  מספר: "number",
  no: "number",
  code: "code",
  קוד: "code",
  kind: "kind",
  סוג: "kind",
  "סוג קוד": "kind",
  note: "note",
  הערה: "note",
  notes: "note",
  remark: "note",
};

function normalizeHeaderLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function resolveField(header: string): keyof BuildingCodeRow | null {
  const t = normalizeHeaderLabel(header);
  if (!t) return null;
  const lower = t.toLowerCase();
  return HEADER_TO_FIELD[t] ?? HEADER_TO_FIELD[lower] ?? null;
}

function emptyRow(): BuildingCodeRow {
  return {
    area: "",
    street: "",
    number: "",
    code: "",
    kind: "",
    note: "",
  };
}

export function parseSheetGrid(values: string[][] | null | undefined): ParsedSheetResult {
  const warnings: string[] = [];
  if (!values || values.length === 0) {
    warnings.push("הרשימה ריקה או שאין נתונים זמינים.");
    return { rows: [], warnings };
  }

  const headerRow = values[0] ?? [];
  const fieldByCol = new Map<number, keyof BuildingCodeRow>();

  headerRow.forEach((cell, colIndex) => {
    const field = resolveField(cell);
    if (field && !Array.from(fieldByCol.values()).includes(field)) {
      fieldByCol.set(colIndex, field);
    }
  });

  const required: (keyof BuildingCodeRow)[] = ["street", "number", "code"];
  const missing = required.filter((k) => !Array.from(fieldByCol.values()).includes(k));
  if (missing.length) {
    warnings.push(
      `חסרות עמודות בכותרות: ${missing.join(", ")}. נדרשות לפחות עמודות שממופות ל־כתובת/רחוב, מספר וקוד (למשל: כתובת, מספר, קוד).`,
    );
    return { rows: [], warnings };
  }

  const rows: BuildingCodeRow[] = [];
  for (let r = 1; r < values.length; r++) {
    const line = values[r] ?? [];
    const row = emptyRow();
    fieldByCol.forEach((field, colIndex) => {
      const cell = line[colIndex];
      row[field] = cell == null ? "" : String(cell).trim();
    });

    const hasAddress =
      row.street !== "" || row.number !== "" || row.code !== "";
    if (!hasAddress) continue;

    rows.push(row);
  }

  return { rows, warnings };
}

export const SAMPLE_ROWS: BuildingCodeRow[] = [
  {
    area: "וותיקה",
    street: "העלייה",
    number: "3",
    code: "1417",
    kind: "מפתח",
    note: "",
  },
  {
    area: "וותיקה",
    street: "ינאי",
    number: "3",
    code: "3131",
    kind: "קוד",
    note: "",
  },
  {
    area: "משקפיים נווה שמיר",
    street: "קוק",
    number: "22",
    code: "9958",
    kind: "קוד",
    note: "",
  },
];
