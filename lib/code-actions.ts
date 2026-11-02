"use server";

import { getCodes, clearCache } from "./codes-cache";
import {
  type BuildingCodeRow,
  buildFieldByCol,
  buildRowArray,
  parseRowFromLine,
} from "./building-codes";
import {
  getCodesSheetConfig,
  getSheetsClient,
  sheetRangeForRow,
} from "./google-sheets";
import { checkEnvPassword } from "./env-password";
import { normalizeText, normalizeHouseNumber } from "./normalize";
import { filterRowsWithIndex } from "./search-index";

export type AddressMatch = {
  row: BuildingCodeRow;
  sheetRowIndex: number;
};

function rowFingerprint(row: BuildingCodeRow): string {
  return [
    normalizeText(row.area),
    normalizeText(row.street),
    normalizeHouseNumber(row.number),
    row.code.trim(),
    normalizeText(row.kind),
    normalizeText(row.note),
  ].join("|");
}

function isDuplicateRow(a: BuildingCodeRow, b: BuildingCodeRow): boolean {
  return (
    normalizeText(a.area) === normalizeText(b.area) &&
    normalizeText(a.street) === normalizeText(b.street) &&
    normalizeHouseNumber(a.number) === normalizeHouseNumber(b.number) &&
    a.code.trim() === b.code.trim()
  );
}

function checkAddCodePassword(
  passwordAttempt: string,
): { ok: true } | { ok: false; error: string } {
  return checkEnvPassword(
    "ADD_CODE_PASSWORD",
    passwordAttempt,
    "לא מוגדר קוד אבטחה להוספת קודים בשרת.",
  );
}

async function readSheetRowsWithIndices(): Promise<
  | {
      ok: true;
      range: string;
      headerLength: number;
      rows: AddressMatch[];
      fieldByCol: Map<number, keyof BuildingCodeRow>;
    }
  | { ok: false; error: string }
> {
  const config = getCodesSheetConfig();
  if ("error" in config) {
    return { ok: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const values = sheetData.data.values || [];
    if (values.length === 0) {
      return { ok: false, error: "לא נמצאו נתונים או כותרות בגיליון." };
    }

    const headerRow = values[0];
    const fieldByCol = buildFieldByCol(headerRow);
    const rows: AddressMatch[] = [];

    for (let r = 1; r < values.length; r++) {
      const line = values[r] ?? [];
      const row = parseRowFromLine(line, fieldByCol);
      const hasAddress =
        row.street !== "" || row.number !== "" || row.code !== "";
      if (!hasAddress) continue;
      rows.push({ row, sheetRowIndex: r + 1 });
    }

    return {
      ok: true,
      range: config.range,
      headerLength: headerRow.length,
      rows,
      fieldByCol,
    };
  } catch (err) {
    console.error("Error reading Google Sheet:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה בקריאת הגיליון";
    return { ok: false, error: message };
  }
}

async function refreshCodesCache(): Promise<void> {
  clearCache();
  await getCodes({ bypassCache: true });
}

export async function verifyAddCodePassword(
  passwordAttempt: string,
): Promise<{ verified: boolean; error?: string }> {
  const result = checkAddCodePassword(passwordAttempt);
  if (!result.ok) {
    return { verified: false, error: result.error };
  }
  return { verified: true };
}

export async function findAddressMatches(
  street: string,
  number: string,
  area?: string,
): Promise<{ matches: AddressMatch[] }> {
  const trimmedStreet = street.trim();
  const trimmedNumber = number.trim();
  const trimmedArea = area?.trim();

  if (!trimmedStreet || !trimmedNumber) {
    return { matches: [] };
  }

  try {
    const payload = await getCodes({ bypassCache: false });
    const matchedRows = filterRowsWithIndex(
      payload.rows,
      payload.index,
      trimmedStreet,
      trimmedNumber,
      trimmedArea || undefined,
    );

    if (matchedRows.length === 0) {
      return { matches: [] };
    }

    const sheetResult = await readSheetRowsWithIndices();
    if (!sheetResult.ok) {
      return {
        matches: matchedRows.map((row, index) => ({
          row,
          sheetRowIndex: index + 2,
        })),
      };
    }

    const fingerprintToIndex = new Map<string, number>();
    for (const sheetRow of sheetResult.rows) {
      fingerprintToIndex.set(
        rowFingerprint(sheetRow.row),
        sheetRow.sheetRowIndex,
      );
    }

    const matches: AddressMatch[] = [];
    for (const row of matchedRows) {
      const sheetRowIndex = fingerprintToIndex.get(rowFingerprint(row));
      if (sheetRowIndex != null) {
        matches.push({ row, sheetRowIndex });
      }
    }

    return { matches };
  } catch (err) {
    console.error("Error finding address matches:", err);
    return { matches: [] };
  }
}

export async function updateBuildingCode(
  passwordAttempt: string,
  sheetRowIndex: number,
  rowData: BuildingCodeRow,
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddCodePassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const street = rowData.street?.trim();
  const number = rowData.number?.trim();
  const code = rowData.code?.trim();

  if (!street || !number || !code) {
    return { success: false, error: "חובה למלא רחוב, מספר בית וקוד." };
  }

  if (sheetRowIndex < 2) {
    return { success: false, error: "שורה לעדכון אינה תקינה." };
  }

  try {
    const existing = await getCodes({ bypassCache: false });
    const sheetResult = await readSheetRowsWithIndices();
    const updatingRow = sheetResult.ok
      ? sheetResult.rows.find((entry) => entry.sheetRowIndex === sheetRowIndex)
          ?.row
      : undefined;
    const updatingFingerprint = updatingRow
      ? rowFingerprint(updatingRow)
      : null;

    const isDuplicate = existing.rows.some((row) => {
      if (updatingFingerprint && rowFingerprint(row) === updatingFingerprint) {
        return false;
      }
      return isDuplicateRow(row, rowData);
    });

    if (isDuplicate) {
      return {
        success: false,
        error: "קוד זה כבר קיים במערכת עבור כתובת זו.",
      };
    }
  } catch (err) {
    console.error("Error performing duplicate check:", err);
    return { success: false, error: "שגיאה בבדיקת כפילויות במערכת." };
  }

  const config = getCodesSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheetResult = await readSheetRowsWithIndices();
    if (!sheetResult.ok) {
      return { success: false, error: sheetResult.error };
    }

    const targetExists = sheetResult.rows.some(
      (entry) => entry.sheetRowIndex === sheetRowIndex,
    );
    if (!targetExists) {
      return { success: false, error: "השורה לעדכון לא נמצאה בגיליון." };
    }

    const sheets = await getSheetsClient(config.credentials);
    const newRowArray = buildRowArray(
      sheetResult.fieldByCol,
      sheetResult.headerLength,
      rowData,
    );
    const rowRange = sheetRangeForRow(config.range, sheetRowIndex);

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: rowRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRowArray],
      },
    });

    await refreshCodesCache();
    return { success: true };
  } catch (err) {
    console.error("Error updating row in Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה בעדכון הגיליון";
    return { success: false, error: message };
  }
}

export async function addBuildingCode(
  passwordAttempt: string,
  rowData: BuildingCodeRow,
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddCodePassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const street = rowData.street?.trim();
  const number = rowData.number?.trim();
  const code = rowData.code?.trim();

  if (!street || !number || !code) {
    return { success: false, error: "חובה למלא רחוב, מספר בית וקוד." };
  }

  try {
    const existing = await getCodes({ bypassCache: false });
    const isDuplicate = existing.rows.some((row) =>
      isDuplicateRow(row, rowData),
    );

    if (isDuplicate) {
      return {
        success: false,
        error: "קוד זה כבר קיים במערכת עבור כתובת זו.",
      };
    }
  } catch (err) {
    console.error("Error performing duplicate check:", err);
    return { success: false, error: "שגיאה בבדיקת כפילויות במערכת." };
  }

  const config = getCodesSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const values = sheetData.data.values || [];
    if (values.length === 0) {
      return { success: false, error: "לא נמצאו נתונים או כותרות בגיליון." };
    }

    const headerRow = values[0];
    const fieldByCol = buildFieldByCol(headerRow);
    const newRowArray = buildRowArray(fieldByCol, headerRow.length, rowData);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: config.range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRowArray],
      },
    });

    await refreshCodesCache();
    return { success: true };
  } catch (err) {
    console.error("Error appending row to Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה בשמירה בגיליון";
    return { success: false, error: message };
  }
}


export type CodeWithIndex = BuildingCodeRow & { sheetRowIndex: number };

export async function deleteBuildingCode(
  passwordAttempt: string,
  sheetRowIndex: number,
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddCodePassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  if (sheetRowIndex < 2) {
    return { success: false, error: "שורה למחיקה אינה תקינה." };
  }

  const config = getCodesSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const values = sheetData.data.values || [];
    if (sheetRowIndex > values.length) {
      return { success: false, error: "השורה למחיקה לא נמצאה בגיליון." };
    }

    const nextValues = values.filter((_, idx) => idx !== sheetRowIndex - 1);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: config.range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: nextValues,
      },
    });

    await refreshCodesCache();
    return { success: true };
  } catch (err) {
    console.error("Error deleting row from Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה במחיקה מהגיליון";
    return { success: false, error: message };
  }
}

export async function getCodesWithIndices(): Promise<{
  rows: CodeWithIndex[];
  warnings: string[];
}> {
  const sheetResult = await readSheetRowsWithIndices();
  if (sheetResult.ok) {
    return {
      rows: sheetResult.rows.map((entry) => ({
        ...entry.row,
        sheetRowIndex: entry.sheetRowIndex,
      })),
      warnings: [],
    };
  }

  const payload = await getCodes({ bypassCache: false });
  return {
    rows: payload.rows.map((row, idx) => ({
      ...row,
      sheetRowIndex: idx + 2,
    })),
    warnings: payload.warnings,
  };
}
