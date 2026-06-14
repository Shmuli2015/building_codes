"use server";

import { google } from "googleapis";
import { getCodes, clearCache } from "./sheet-cache";
import { parseSheetGrid, type BuildingCodeRow } from "./building-codes";
import { normalizeText, normalizeHouseNumber } from "./normalize";
import fs from "fs";
import path from "path";

const CACHE_FILE_PATH = path.join(process.cwd(), ".next", "google-sheet-cache.json");

export async function addBuildingCode(
  passwordAttempt: string,
  rowData: BuildingCodeRow
): Promise<{ success: boolean; error?: string }> {
  const secretCode = process.env.ADD_CODE_PASSWORD;
  if (!secretCode) {
    return { success: false, error: "לא מוגדר קוד אבטחה להוספת קודים בשרת." };
  }

  if (passwordAttempt !== secretCode) {
    return { success: false, error: "קוד אבטחה שגוי." };
  }

  // Validate fields
  const street = rowData.street?.trim();
  const number = rowData.number?.trim();
  const code = rowData.code?.trim();

  if (!street || !number || !code) {
    return { success: false, error: "חובה למלא רחוב, מספר בית וקוד." };
  }

  // Duplicate Check
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
    // Continue even if check fails to not block writes unnecessarily, or block it? 
    // It's safer to block or at least report it. Let's report it if we can't load current codes.
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

    // 1. Get sheet data to understand column mapping
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const values = sheetData.data.values || [];
    if (values.length === 0) {
      return { success: false, error: "לא נמצאו נתונים או כותרות בגיליון." };
    }

    const headerRow = values[0];
    
    // Map header columns to BuildingCodeRow fields (matching lib/building-codes.ts HEADER_TO_FIELD)
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

    // Construct the new row array matching the header layout
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

    // 2. Append the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRowArray],
      },
    });

    // 3. Clear file cache
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        fs.unlinkSync(CACHE_FILE_PATH);
      }
    } catch (err) {
      console.warn("Failed to delete cache file:", err);
    }

    // 4. Force reload sheet-cache memory and next/cache tag revalidation
    clearCache();
    await getCodes({ bypassCache: true });

    return { success: true };
  } catch (err) {
    console.error("Error appending row to Google Sheets:", err);
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה בשמירה בגיליון";
    return { success: false, error: message };
  }
}
