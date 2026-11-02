"use server";

import { getSession } from "./auth-actions";
import {
  clearEmailCache,
  getAuthorizedEmails,
  getAuthorizedUsers,
} from "./auth-cache";
import {
  buildAuthSheetRow,
  getEmailFromAuthRow,
  isValidEmail,
  normalizeAuthSheetRow,
  resolveAuthColumns,
} from "./auth-sheet";
import type { AuthorizedUser } from "./auth-types";
import { checkEnvPassword } from "./env-password";
import { getAuthSheetConfig, getSheetsClient } from "./google-sheets";

function checkAddAuthorizedPassword(
  passwordAttempt: string,
): { ok: true } | { ok: false; error: string } {
  return checkEnvPassword(
    "ADD_AUTHORIZED_PASSWORD",
    passwordAttempt,
    "לא מוגדר קוד אבטחה להוספת מורשים בשרת.",
  );
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

  const config = getAuthSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
    });
    const header = (existing.data.values?.[0] ?? ["אימייל", "שם"]).map(
      (cell) => String(cell).trim(),
    );
    const layout = resolveAuthColumns(header);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: config.range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [buildAuthSheetRow(email, name, layout)],
      },
    });

    clearEmailCache();
    return { success: true };
  } catch (err) {
    console.error("Error appending authorized email to Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה בשמירה בגיליון";
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

  const config = getAuthSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
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
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const nextValues = [
      header,
      ...filtered.map((row) => normalizeAuthSheetRow(row, layout)),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: config.range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: nextValues,
      },
    });

    clearEmailCache();
    return { success: true };
  } catch (err) {
    console.error("Error removing authorized email from Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה במחיקה מהגיליון";
    return { success: false, error: message };
  }
}

export async function updateAuthorizedEmail(
  passwordAttempt: string,
  originalEmailInput: string,
  newEmailInput: string,
  newNameInput: string,
): Promise<{ success: boolean; error?: string }> {
  const authResult = checkAddAuthorizedPassword(passwordAttempt);
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const originalEmail = originalEmailInput.trim().toLowerCase();
  const newEmail = newEmailInput.trim().toLowerCase();
  const newName = newNameInput.trim();

  if (!originalEmail || !isValidEmail(originalEmail)) {
    return { success: false, error: "כתובת האימייל המקורית אינה תקינה." };
  }
  if (!newName) {
    return { success: false, error: "יש להזין שם." };
  }
  if (!newEmail) {
    return { success: false, error: "יש להזין כתובת אימייל." };
  }
  if (!isValidEmail(newEmail)) {
    return { success: false, error: "כתובת האימייל אינה תקינה." };
  }

  if (newEmail !== originalEmail) {
    try {
      const existing = await getAuthorizedEmails();
      if (existing.includes(newEmail)) {
        return { success: false, error: "אימייל זה כבר מורשה במערכת." };
      }
    } catch (err) {
      console.error("Error checking authorized emails:", err);
      return { success: false, error: "שגיאה בבדיקת רשימת המורשים." };
    }
  }

  const config = getAuthSheetConfig();
  if ("error" in config) {
    return { success: false, error: config.error };
  }

  try {
    const sheets = await getSheetsClient(config.credentials);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const values = res.data.values ?? [];
    if (values.length === 0) {
      return { success: false, error: "אימייל זה לא נמצא ברשימת המורשים." };
    }

    const header = values[0].map((cell) => String(cell).trim());
    const layout = resolveAuthColumns(header);
    const dataRows = values.slice(1);

    const rowIndex = dataRows.findIndex(
      (row) => getEmailFromAuthRow(row, layout) === originalEmail,
    );

    if (rowIndex === -1) {
      return { success: false, error: "אימייל זה לא נמצא ברשימת המורשים." };
    }

    dataRows[rowIndex] = buildAuthSheetRow(newEmail, newName, layout);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.sheetId,
      range: config.range,
    });

    const nextValues = [
      header,
      ...dataRows.map((row) => normalizeAuthSheetRow(row, layout)),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: config.range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: nextValues,
      },
    });

    clearEmailCache();
    return { success: true };
  } catch (err) {
    console.error("Error updating authorized email in Google Sheets:", err);
    const message =
      err instanceof Error ? err.message : "שגיאה לא ידועה בעדכון בגיליון";
    return { success: false, error: message };
  }
}