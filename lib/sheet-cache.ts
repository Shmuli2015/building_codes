import { cacheLife, cacheTag } from "next/cache";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

import {
  type BuildingCodeRow,
  SAMPLE_ROWS,
  parseSheetGrid,
} from "./building-codes";
import { buildSearchIndex, type SearchIndex } from "./search-index";

const DEFAULT_RANGE = "גיליון1!A:F";
const DEFAULT_AUTH_RANGE = "מורשים!A:B";
const DEFAULT_TTL_MS = 180_000;

import type { AuthorizedUser } from "./auth-types";

export type { AuthorizedUser };

export type AuthColumnLayout = {
  emailCol: number;
  nameCol: number;
};

function authSheetRange(): string {
  return process.env.GOOGLE_SHEET_AUTH_RANGE?.trim() || DEFAULT_AUTH_RANGE;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function resolveAuthColumns(header: string[]): AuthColumnLayout {
  let emailCol = -1;
  let nameCol = -1;

  header.forEach((cell, index) => {
    const normalized = cell.trim().toLowerCase().replace(/\s+/g, " ");

    if (
      emailCol < 0 &&
      (normalized.includes("אימייל") ||
        normalized.includes("מייל") ||
        normalized.includes("email") ||
        normalized === "mail")
    ) {
      emailCol = index;
    }

    if (
      nameCol < 0 &&
      !normalized.includes("אימייל") &&
      !normalized.includes("מייל") &&
      !normalized.includes("email") &&
      (normalized.includes("שם") || normalized.includes("name"))
    ) {
      nameCol = index;
    }
  });

  // A = אימייל, B = שם
  if (emailCol < 0) emailCol = 0;
  if (nameCol < 0) nameCol = 1;

  return { emailCol, nameCol };
}

export function buildAuthSheetRow(
  email: string,
  name: string,
  layout: AuthColumnLayout,
): string[] {
  const maxCol = Math.max(layout.emailCol, layout.nameCol);
  const row = Array.from({ length: maxCol + 1 }, () => "");
  row[layout.emailCol] = email;
  row[layout.nameCol] = name;
  return row;
}

export function getEmailFromAuthRow(
  row: string[],
  layout: AuthColumnLayout,
): string {
  return String(row[layout.emailCol] ?? "").trim().toLowerCase();
}

export function normalizeAuthSheetRow(
  row: string[],
  layout: AuthColumnLayout,
): string[] {
  return buildAuthSheetRow(
    getEmailFromAuthRow(row, layout),
    String(row[layout.nameCol] ?? "").trim(),
    layout,
  );
}

export function parseAuthorizedSheetRows(
  values: string[][] | null | undefined,
): AuthorizedUser[] {
  if (!values?.length) return [];

  const header = values[0].map((cell) => String(cell).trim());
  const layout = resolveAuthColumns(header);

  return values
    .slice(1)
    .map((row) => ({
      email: getEmailFromAuthRow(row, layout),
      name: String(row[layout.nameCol] ?? "").trim(),
    }))
    .filter((user) => user.email && isValidEmail(user.email));
}

type CodesMemoryCacheEntry = {
  rows: BuildingCodeRow[];
  index: SearchIndex;
  warnings: string[];
  expiresAt: number;
  source: "sheet" | "mock";
  timestamp: number;
};

let codesMemoryCache: CodesMemoryCacheEntry | null = null;

function ttlMs(): number {
  const raw = process.env.CODES_CACHE_TTL_MS;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_TTL_MS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TTL_MS;
}

export type CachedCodesPayload = {
  rows: BuildingCodeRow[];
  index: SearchIndex;
  warnings: string[];
  source: "sheet" | "mock";
  cacheExpiresAt: number;
  cacheHit: boolean;
};

async function fetchFromGoogleSheetsRaw(): Promise<{
  rows: BuildingCodeRow[];
  warnings: string[];
  source: "sheet" | "mock";
}> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    return {
      rows: SAMPLE_ROWS,
      warnings: ["מצב הדגמה — מוצגות שורות לדוגמה בלבד."],
      source: "mock",
    };
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
  } catch {
    return {
      rows: [],
      warnings: ["קובץ ההגדרות אינו בפורמט תקין."],
      source: "mock",
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const range = process.env.GOOGLE_SHEET_RANGE?.trim() || DEFAULT_RANGE;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const parsed = parseSheetGrid(res.data.values);
  return {
    rows: parsed.rows,
    warnings: parsed.warnings,
    source: "sheet",
  };
}

const CACHE_FILE_PATH = path.join(process.cwd(), ".next", "google-sheet-cache.json");

export function clearCache() {
  codesMemoryCache = null;
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      fs.unlinkSync(CACHE_FILE_PATH);
    }
  } catch (err) {
    console.warn("Failed to delete cache file in clearCache:", err);
  }
}

interface FileCacheEntry {
  rows: BuildingCodeRow[];
  index?: SearchIndex;
  warnings: string[];
  source: "sheet" | "mock";
  timestamp: number;
}

type SheetFetchResult = {
  rows: BuildingCodeRow[];
  index: SearchIndex;
  warnings: string[];
  source: "sheet" | "mock";
  timestamp: number;
  cacheHit: boolean;
};

function toMemoryCache(
  result: SheetFetchResult,
  ttl: number,
): CodesMemoryCacheEntry {
  return {
    rows: result.rows,
    index: result.index,
    warnings: result.warnings,
    source: result.source,
    timestamp: result.timestamp,
    expiresAt: result.timestamp + ttl,
  };
}

function writeFileCache(entry: FileCacheEntry): void {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(entry), "utf8");
  } catch (err) {
    console.warn("Failed to write filesystem cache:", err);
  }
}

function readFileCacheEntry(): FileCacheEntry | null {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) return null;
    const fileContent = fs.readFileSync(CACHE_FILE_PATH, "utf8");
    return JSON.parse(fileContent) as FileCacheEntry;
  } catch (err) {
    console.warn("Failed to read filesystem cache:", err);
    return null;
  }
}

function fileEntryToResult(entry: FileCacheEntry, cacheHit: boolean): SheetFetchResult {
  const index = entry.index ?? buildSearchIndex(entry.rows);
  return {
    rows: entry.rows,
    index,
    warnings: entry.warnings,
    source: entry.source,
    timestamp: entry.timestamp,
    cacheHit,
  };
}

async function fetchFromGoogleSheets(bypassCache = false): Promise<SheetFetchResult> {
  const ttl = ttlMs();
  const now = Date.now();

  if (!bypassCache && codesMemoryCache && codesMemoryCache.expiresAt > now) {
    return {
      rows: codesMemoryCache.rows,
      index: codesMemoryCache.index,
      warnings: codesMemoryCache.warnings,
      source: codesMemoryCache.source,
      timestamp: codesMemoryCache.timestamp,
      cacheHit: true,
    };
  }

  if (!bypassCache) {
    const entry = readFileCacheEntry();
    if (entry && now - entry.timestamp < ttl) {
      const result = fileEntryToResult(entry, true);
      if (!entry.index) {
        writeFileCache({ ...entry, index: result.index });
      }
      codesMemoryCache = toMemoryCache(result, ttl);
      return result;
    }
  }

  try {
    const fresh = await fetchFromGoogleSheetsRaw();
    const index = buildSearchIndex(fresh.rows);
    const result: SheetFetchResult = {
      rows: fresh.rows,
      index,
      warnings: fresh.warnings,
      source: fresh.source,
      timestamp: now,
      cacheHit: false,
    };

    writeFileCache({
      rows: fresh.rows,
      index,
      warnings: fresh.warnings,
      source: fresh.source,
      timestamp: now,
    });
    codesMemoryCache = toMemoryCache(result, ttl);

    return result;
  } catch (err) {
    const entry = readFileCacheEntry();
    if (entry) {
      console.warn("Using expired cache as fallback due to fetch error:", err);
      const result = fileEntryToResult(entry, true);
      result.warnings = [
        ...result.warnings,
        "שימוש בנתונים שמורים עקב שגיאה בעדכון.",
      ];
      codesMemoryCache = toMemoryCache(result, ttl);
      return result;
    }
    throw err;
  }
}

async function getCachedSheetData(bypassCache = false): Promise<SheetFetchResult> {
  "use cache";
  cacheTag("codes");
  cacheLife("minutes");

  return fetchFromGoogleSheets(bypassCache);
}

type EmailCacheEntry = {
  users: AuthorizedUser[];
  expiresAt: number;
};

let emailCache: EmailCacheEntry | null = null;

export function clearEmailCache() {
  emailCache = null;
}

export async function getAuthorizedUsers(): Promise<AuthorizedUser[]> {
  const now = Date.now();
  const ttl = ttlMs();

  if (emailCache && emailCache.expiresAt > now) {
    return emailCache.users;
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    const devEmail = process.env.AUTH_ALLOWLIST_DEV_EMAIL || "";
    const users = devEmail
      ? [{ email: devEmail.toLowerCase(), name: "" }]
      : [];
    emailCache = { users, expiresAt: now + ttl };
    return users;
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(jsonRaw) as Record<string, unknown>;
  } catch {
    return [];
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const range = authSheetRange();

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const users = parseAuthorizedSheetRows(res.data.values);

    emailCache = { users, expiresAt: now + ttl };
    return users;
  } catch (err) {
    console.error("Error fetching authorized emails:", err);
    return [];
  }
}

export async function getAuthorizedEmails(): Promise<string[]> {
  const users = await getAuthorizedUsers();
  return users.map((user) => user.email);
}


export async function getCodes(options: {
  bypassCache?: boolean;
}): Promise<CachedCodesPayload> {
  const ttl = ttlMs();

  if (options.bypassCache) {
    const { connection } = await import("next/server");
    await connection();
    const { revalidateTag } = await import("next/cache");
    revalidateTag("codes", "max");
    clearCache();

    const freshData = await fetchFromGoogleSheets(true);
    return {
      rows: freshData.rows,
      index: freshData.index,
      warnings: freshData.warnings,
      source: freshData.source,
      cacheExpiresAt: freshData.timestamp + ttl,
      cacheHit: false,
    };
  }

  const freshData = await getCachedSheetData(false);
  return {
    rows: freshData.rows,
    index: freshData.index,
    warnings: freshData.warnings,
    source: freshData.source,
    cacheExpiresAt: freshData.timestamp + ttl,
    cacheHit: freshData.cacheHit,
  };
}
