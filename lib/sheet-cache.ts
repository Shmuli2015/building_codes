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
const DEFAULT_TTL_MS = 180_000;

type CacheEntry = {
  rows: BuildingCodeRow[];
  index: SearchIndex;
  warnings: string[];
  expiresAt: number;
  source: "sheet" | "mock";
};

let cache: CacheEntry | null = null;

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

interface FileCacheEntry {
  rows: BuildingCodeRow[];
  warnings: string[];
  source: "sheet" | "mock";
  timestamp: number;
}

async function fetchFromGoogleSheets(bypassCache = false): Promise<{
  rows: BuildingCodeRow[];
  warnings: string[];
  source: "sheet" | "mock";
}> {
  const ttl = ttlMs();
  const now = Date.now();

  if (!bypassCache) {
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        const fileContent = fs.readFileSync(CACHE_FILE_PATH, "utf8");
        const entry = JSON.parse(fileContent) as FileCacheEntry;
        if (now - entry.timestamp < ttl) {
          return {
            rows: entry.rows,
            warnings: entry.warnings,
            source: entry.source,
          };
        }
      }
    } catch (err) {
      console.warn("Failed to read filesystem cache:", err);
    }
  }

  try {
    const fresh = await fetchFromGoogleSheetsRaw();
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE_PATH), { recursive: true });
      fs.writeFileSync(
        CACHE_FILE_PATH,
        JSON.stringify({
          rows: fresh.rows,
          warnings: fresh.warnings,
          source: fresh.source,
          timestamp: now,
        } as FileCacheEntry),
        "utf8"
      );
    } catch (err) {
      console.warn("Failed to write filesystem cache:", err);
    }

    return fresh;
  } catch (err) {
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        const fileContent = fs.readFileSync(CACHE_FILE_PATH, "utf8");
        const entry = JSON.parse(fileContent) as FileCacheEntry;
        console.warn("Using expired cache as fallback due to fetch error:", err);
        return {
          rows: entry.rows,
          warnings: [...entry.warnings, "שימוש בנתונים שמורים עקב שגיאה בעדכון."],
          source: entry.source,
        };
      }
    } catch {
    }
    throw err;
  }
}

async function getCachedSheetData(bypassCache = false): Promise<{
  rows: BuildingCodeRow[];
  index: SearchIndex;
  warnings: string[];
  source: "sheet" | "mock";
}> {
  "use cache";
  cacheTag("codes");
  cacheLife("minutes");

  const fresh = await fetchFromGoogleSheets(bypassCache);
  const index = buildSearchIndex(fresh.rows);
  return {
    ...fresh,
    index,
  };
}

type EmailCacheEntry = {
  emails: string[];
  expiresAt: number;
};

let emailCache: EmailCacheEntry | null = null;

export async function getAuthorizedEmails(): Promise<string[]> {
  const now = Date.now();
  const ttl = ttlMs();

  if (emailCache && emailCache.expiresAt > now) {
    return emailCache.emails;
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId?.trim() || !jsonRaw?.trim()) {
    const devEmail = process.env.AUTH_ALLOWLIST_DEV_EMAIL || "";
    const emails = [devEmail.toLowerCase()].filter(Boolean);
    emailCache = { emails, expiresAt: now + ttl };
    return emails;
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
  const range = process.env.GOOGLE_SHEET_AUTH_RANGE?.trim() || "מורשים!A:A";

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const values = res.data.values;
    const emails = values
      ? values
          .flat()
          .map((email) => String(email).trim().toLowerCase())
          .filter(Boolean)
      : [];

    emailCache = { emails, expiresAt: now + ttl };
    return emails;
  } catch (err) {
    console.error("Error fetching authorized emails:", err);
    return [];
  }
}


export async function getCodes(options: {
  bypassCache?: boolean;
}): Promise<CachedCodesPayload> {
  const { connection } = await import("next/server");
  await connection();

  if (options.bypassCache) {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("codes", "max");
    cache = null;
  }

  const now = Date.now();
  const ttl = ttlMs();

  if (!options.bypassCache && cache && cache.expiresAt > now) {
    return {
      rows: cache.rows,
      index: cache.index,
      warnings: cache.warnings,
      source: cache.source,
      cacheExpiresAt: cache.expiresAt,
      cacheHit: true,
    };
  }

  const fresh = await getCachedSheetData(options.bypassCache ?? false);
  cache = {
    rows: fresh.rows,
    index: fresh.index,
    warnings: fresh.warnings,
    source: fresh.source,
    expiresAt: now + ttl,
  };

  return {
    rows: cache.rows,
    index: cache.index,
    warnings: cache.warnings,
    source: cache.source,
    cacheExpiresAt: cache.expiresAt,
    cacheHit: false,
  };
}
