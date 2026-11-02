import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

const DEFAULT_CODES_RANGE = "גיליון1!A:F";
const DEFAULT_AUTH_RANGE = "מורשים!A:B";

export type SheetCredentials =
  | { sheetId: string; credentials: Record<string, unknown> }
  | { error: string };

export type SheetConfig =
  | { sheetId: string; credentials: Record<string, unknown>; range: string }
  | { error: string };

export type SheetsAccess = "readonly" | "readwrite";

export function getSheetCredentials(): SheetCredentials {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    return { error: "הגדרות Google Sheets חסרות בשרת (מצב הדגמה)." };
  }

  try {
    const credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
    return { sheetId, credentials };
  } catch {
    return { error: "קובץ ההגדרות אינו בפורמט תקין." };
  }
}

export function getCodesSheetConfig(): SheetConfig {
  const base = getSheetCredentials();
  if ("error" in base) return base;
  return {
    ...base,
    range: process.env.GOOGLE_SHEET_RANGE?.trim() || DEFAULT_CODES_RANGE,
  };
}

export function getAuthSheetConfig(): SheetConfig {
  const base = getSheetCredentials();
  if ("error" in base) return base;
  return {
    ...base,
    range: process.env.GOOGLE_SHEET_AUTH_RANGE?.trim() || DEFAULT_AUTH_RANGE,
  };
}

export async function getSheetsClient(
  credentials: Record<string, unknown>,
  access: SheetsAccess = "readwrite",
): Promise<sheets_v4.Sheets> {
  const scope =
    access === "readonly"
      ? "https://www.googleapis.com/auth/spreadsheets.readonly"
      : "https://www.googleapis.com/auth/spreadsheets";

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [scope],
  });

  return google.sheets({ version: "v4", auth });
}

export function sheetRangeForRow(
  baseRange: string,
  sheetRowIndex: number,
): string {
  const bang = baseRange.indexOf("!");
  const sheetName = bang >= 0 ? baseRange.slice(0, bang) : baseRange;
  const colPart = bang >= 0 ? baseRange.slice(bang + 1) : "A:F";
  const colMatch = colPart.match(/^([A-Za-z]+):([A-Za-z]+)$/);
  if (colMatch) {
    return `${sheetName}!${colMatch[1]}${sheetRowIndex}:${colMatch[2]}${sheetRowIndex}`;
  }
  return `${sheetName}!A${sheetRowIndex}:F${sheetRowIndex}`;
}
