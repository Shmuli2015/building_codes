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
import { parseSheetGrid, type BuildingCodeRow } from "./building-codes";
import { getSession } from "./auth-actions";
import { normalizeText, normalizeHouseNumber } from "./normalize";
import fs from "fs";
import path from "path";

const CACHE_FILE_PATH = path.join(process.cwd(), ".next", "google-sheet-cache.json");

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
    const isDuplicate = existing.rows.some((row) => {
      return (
        normalizeText(row.area) === normalizeText(rowData.area) &&
        normalizeText(row.street) === normalizeText(street) &&
        normalizeHouseNumber(row.number) === normalizeHouseNumber(number) &&
        row.code.trim() === code
      );
    });

    if (isDuplicate) {
      return { success: false, error: "קוד זה כבר קיים במערכת עבור כתובת זו." };
    }
  } catch (err) {
    console.error("Error performing duplicate check:", err);
    return { success: false, error: "שגיאה בבדיקת כפילויות במערכת." };
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
    const range = process.env.GOOGLE_SHEET_RANGE?.trim() || "גיליון1!A:F";

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const values = sheetData.data.values || [];
    if (values.length === 0) {
      return { success: false, error: "לא נמצאו נתונים או כותרות בגיליון." };
    }

    const headerRow = values[0];

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

    const resolveField = (header: string): keyof BuildingCodeRow | null => {
      const t = header.trim().replace(/\s+/g, " ");
      if (!t) return null;
      const lower = t.toLowerCase();
      return HEADER_TO_FIELD[t] ?? HEADER_TO_FIELD[lower] ?? null;
    };

    const fieldByCol = new Map<number, keyof BuildingCodeRow>();
    headerRow.forEach((cell, colIndex) => {
      const field = resolveField(cell);
      if (field && !Array.from(fieldByCol.values()).includes(field)) {
        fieldByCol.set(colIndex, field);
      }
    });

    const newRowArray: string[] = [];
    const maxColIndex = headerRow.length;
    for (let i = 0; i < maxColIndex; i++) {
      const field = fieldByCol.get(i);
      if (field) {
        newRowArray[i] = (rowData[field] ?? "").trim();
      } else {
        newRowArray[i] = "";
      }
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRowArray],
      },
    });

    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        fs.unlinkSync(CACHE_FILE_PATH);
      }
    } catch (err) {
      console.warn("Failed to delete cache file:", err);
    }

    clearCache();
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
