"use server";

import { google } from "googleapis";
import {
  getCodes,
  clearCache,
  clearEmailCache,
  getAuthorizedEmails,
  getAuthorizedUsers,
  resolveAuthColumns,
  buildAuthSheetRow,
  getEmailFromAuthRow,
  normalizeAuthSheetRow,
} from "./sheet-cache";
import type { AuthorizedUser } from "./auth-types";
import { type BuildingCodeRow } from "./building-codes";
import { getSession } from "./auth-actions";
import { normalizeText, normalizeHouseNumber } from "./normalize";
import { filterRowsWithIndex } from "./search-index";
import fs from "fs";
import path from "path";
import type { sheets_v4 } from "googleapis";

const CACHE_FILE_PATH = path.join(process.cwd(), ".next", "google-sheet-cache.json");
const DEFAULT_SHEET_RANGE = "גיליון1!A:F";

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

export type AddressMatch = {
  row: BuildingCodeRow;
  sheetRowIndex: number;
};

function resolveField(header: string): keyof BuildingCodeRow | null {
  const t = header.trim().replace(/\s+/g, " ");
  if (!t) return null;
  const lower = t.toLowerCase();
  return HEADER_TO_FIELD[t] ?? HEADER_TO_FIELD[lower] ?? null;
}

function buildFieldByCol(headerRow: string[]): Map<number, keyof BuildingCodeRow> {
  const fieldByCol = new Map<number, keyof BuildingCodeRow>();
  headerRow.forEach((cell, colIndex) => {
    const field = resolveField(cell);
    if (field && !Array.from(fieldByCol.values()).includes(field)) {
      fieldByCol.set(colIndex, field);
    }
  });
  return fieldByCol;
}

function parseRowFromLine(
  line: string[],
  fieldByCol: Map<number, keyof BuildingCodeRow>,
): BuildingCodeRow {
  const row: BuildingCodeRow = {
    area: "",
    street: "",
    number: "",
    code: "",
    kind: "",
    note: "",
  };
  fieldByCol.forEach((field, colIndex) => {
    const cell = line[colIndex];
    row[field] = cell == null ? "" : String(cell).trim();
  });
  return row;
}

function buildRowArray(
  fieldByCol: Map<number, keyof BuildingCodeRow>,
  headerLength: number,
  rowData: BuildingCodeRow,
): string[] {
  const newRowArray: string[] = [];
  for (let i = 0; i < headerLength; i++) {
    const field = fieldByCol.get(i);
    if (field) {
      newRowArray[i] = (rowData[field] ?? "").trim();
    } else {
      newRowArray[i] = "";
    }
  }
  return newRowArray;
}

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

function getSheetConfig():
  | { sheetId: string; credentials: Record<string, unknown>; range: string }
  | { error: string } {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    return { error: "הגדרות Google Sheets חסרות בשרת (מצב הדגמה)." };
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
  } catch {
    return { error: "קובץ ההגדרות אינו בפורמט תקין." };
  }

  const range = process.env.GOOGLE_SHEET_RANGE?.trim() || DEFAULT_SHEET_RANGE;
  return { sheetId, credentials, range };
}

async function getSheetsClient(
  credentials: Record<string, unknown>,
): Promise<sheets_v4.Sheets> {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function invalidateCodesCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      fs.unlinkSync(CACHE_FILE_PATH);
    }
  } catch (err) {
    console.warn("Failed to delete cache file:", err);
  }
  clearCache();
}

async function readSheetRowsWithIndices(): Promise<
  | { ok: true; range: string; headerLength: number; rows: AddressMatch[]; fieldByCol: Map<number, keyof BuildingCodeRow> }
  | { ok: false; error: string }
> {
  const config = getSheetConfig();
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
      const hasAddress = row.street !== "" || row.number !== "" || row.code !== "";
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
    const message = err instanceof Error ? err.message : "שגיאה בקריאת הגיליון";
    return { ok: false, error: message };
  }
}

function sheetRangeForRow(baseRange: string, sheetRowIndex: number): string {
  const bang = baseRange.indexOf("!");
  const sheetName = bang >= 0 ? baseRange.slice(0, bang) : baseRange;
  const colPart = bang >= 0 ? baseRange.slice(bang + 1) : "A:F";
  const colMatch = colPart.match(/^([A-Za-z]+):([A-Za-z]+)$/);
  if (colMatch) {
    return `${sheetName}!${colMatch[1]}${sheetRowIndex}:${colMatch[2]}${sheetRowIndex}`;
  }
  return `${sheetName}!A${sheetRowIndex}:F${sheetRowIndex}`;
}

function checkAddCodePassword(passwordAttempt: string): { ok: true } | { ok: false; error: string } {
  const secretCode = process.env.ADD_CODE_PASSWORD;
  if (!secretCode) {
    return { ok: false, error: "לא מוגדר קוד אבטחה להוספת קודים בשרת." };
  }

  if (passwordAttempt !== secretCode) {
    return { ok: false, error: "קוד אבטחה שגוי." };
  }

  return { ok: true };
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
      fingerprintToIndex.set(rowFingerprint(sheetRow.row), sheetRow.sheetRowIndex);
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
      ? sheetResult.rows.find((entry) => entry.sheetRowIndex === sheetRowIndex)?.row
      : undefined;
    const updatingFingerprint = updatingRow ? rowFingerprint(updatingRow) : null;

    const isDuplicate = existing.rows.some((row) => {
      if (updatingFingerprint && rowFingerprint(row) === updatingFingerprint) {
        return false;
      }
      return isDuplicateRow(row, rowData);
    });

    if (isDuplicate) {
      return { success: false, error: "קוד זה כבר קיים במערכת עבור כתובת זו." };
    }
  } catch (err) {
    console.error("Error performing duplicate check:", err);
    return { success: false, error: "שגיאה בבדיקת כפילויות במערכת." };
  }

  const config = getSheetConfig();
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

    invalidateCodesCache();
    await getCodes({ bypassCache: true });

    return { success: true };
  } catch (err) {
    console.error("Error updating row in Google Sheets:", err);
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה בעדכון הגיליון";
    return { success: false, error: message };
  }
}

export async function addBuildingCode(
  passwordAttempt: string,
  rowData: BuildingCodeRow
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
    const isDuplicate = existing.rows.some((row) => isDuplicateRow(row, rowData));

    if (isDuplicate) {
      return { success: false, error: "קוד זה כבר קיים במערכת עבור כתובת זו." };
    }
  } catch (err) {
    console.error("Error performing duplicate check:", err);
    return { success: false, error: "שגיאה בבדיקת כפילויות במערכת." };
  }

  const config = getSheetConfig();
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

    invalidateCodesCache();
    await getCodes({ bypassCache: true });

    return { success: true };
  } catch (err) {
    console.error("Error appending row to Google Sheets:", err);
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה בשמירה בגיליון";
    return { success: false, error: message };
  }
}

function checkAddAuthorizedPassword(
  passwordAttempt: string,
): { ok: true } | { ok: false; error: string } {
  const secretCode = process.env.ADD_AUTHORIZED_PASSWORD;
  if (!secretCode) {
    return { ok: false, error: "לא מוגדר קוד אבטחה להוספת מורשים בשרת." };
  }

  if (passwordAttempt !== secretCode) {
    return { ok: false, error: "קוד אבטחה שגוי." };
  }

  return { ok: true };
}

export async function verifyAddAuthorizedPassword(
  passwordAttempt: string,
): Promise<{ verified: boolean; error?: string }> {
  const result = checkAddAuthorizedPassword(passwordAttempt);
  if (!result.ok) {
    return { verified: false, error: result.error };
  }
  return { verified: true };
}

export async function listAuthorizedEmails(
  passwordAttempt: string,
): Promise<{ success: boolean; users?: AuthorizedUser[]; error?: string }> {
  const authResult = checkAddAuthorizedPassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const users = await getAuthorizedUsers();
    return { success: true, users };
  } catch (err) {
    console.error("Error fetching authorized emails:", err);
    return { success: false, error: "שגיאה בטעינת רשימת המורשים." };
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function addAuthorizedEmail(
  passwordAttempt: string,
  emailInput: string,
  nameInput = "",
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddAuthorizedPassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const email = emailInput.trim().toLowerCase();
  const name = nameInput.trim();
  if (!name) {
    return { success: false, error: "יש להזין שם." };
  }
  if (!email) {
    return { success: false, error: "יש להזין כתובת אימייל." };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "כתובת האימייל אינה תקינה." };
  }

  try {
    const existing = await getAuthorizedEmails();
    if (existing.includes(email)) {
      return { success: false, error: "אימייל זה כבר מורשה במערכת." };
    }
  } catch (err) {
    console.error("Error checking authorized emails:", err);
    return { success: false, error: "שגיאה בבדיקת רשימת המורשים." };
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    return { success: false, error: "הגדרות Google Sheets חסרות בשרת (מצב הדגמה)." };
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
  } catch {
    return { success: false, error: "קובץ ההגדרות אינו בפורמט תקין." };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const range =
      process.env.GOOGLE_SHEET_AUTH_RANGE?.trim() || "מורשים!A:B";

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    const header = (existing.data.values?.[0] ?? ["אימייל", "שם"]).map((cell) =>
      String(cell).trim(),
    );
    const layout = resolveAuthColumns(header);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [buildAuthSheetRow(email, name, layout)],
      },
    });

    clearEmailCache();

    return { success: true };
  } catch (err) {
    console.error("Error appending authorized email to Google Sheets:", err);
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה בשמירה בגיליון";
    return { success: false, error: message };
  }
}

export async function removeAuthorizedEmail(
  passwordAttempt: string,
  emailInput: string,
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddAuthorizedPassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return { success: false, error: "יש להזין כתובת אימייל." };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "כתובת האימייל אינה תקינה." };
  }

  const session = await getSession();
  if (session?.email?.toLowerCase() === email) {
    return { success: false, error: "לא ניתן למחוק את המשתמש המחובר כעת." };
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    return { success: false, error: "הגדרות Google Sheets חסרות בשרת (מצב הדגמה)." };
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
  } catch {
    return { success: false, error: "קובץ ההגדרות אינו בפורמט תקין." };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const range =
      process.env.GOOGLE_SHEET_AUTH_RANGE?.trim() || "מורשים!A:B";

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const values = res.data.values ?? [];
    if (values.length === 0) {
      return { success: false, error: "אימייל זה לא נמצא ברשימת המורשים." };
    }

    const header = values[0].map((cell) => String(cell).trim());
    const layout = resolveAuthColumns(header);
    const dataRows = values.slice(1);
    const emailExists = dataRows.some(
      (row) => getEmailFromAuthRow(row, layout) === email,
    );

    if (!emailExists) {
      return { success: false, error: "אימייל זה לא נמצא ברשימת המורשים." };
    }

    const filtered = dataRows.filter(
      (row) => getEmailFromAuthRow(row, layout) !== email,
    );

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range,
    });

    const nextValues = [
      header,
      ...filtered.map((row) => normalizeAuthSheetRow(row, layout)),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: nextValues,
      },
    });

    clearEmailCache();

    return { success: true };
  } catch (err) {
    console.error("Error removing authorized email from Google Sheets:", err);
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה במחיקה מהגיליון";
    return { success: false, error: message };
  }
}
