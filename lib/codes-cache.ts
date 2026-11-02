import { cacheLife, cacheTag } from "next/cache";
import fs from "fs";
import path from "path";

import {
  type BuildingCodeRow,
  SAMPLE_ROWS,
  parseSheetGrid,
} from "./building-codes";
import { getCodesSheetConfig, getSheetsClient } from "./google-sheets";
import { buildSearchIndex, type SearchIndex } from "./search-index";

const DEFAULT_TTL_MS = 180_000;
const CACHE_FILE_PATH = path.join(
  process.cwd(),
  ".next",
  "google-sheet-cache.json",
);

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

async function fetchFromGoogleSheetsRaw(): Promise<{
  rows: BuildingCodeRow[];
  warnings: string[];
  source: "sheet" | "mock";
}> {
  const config = getCodesSheetConfig();
  if ("error" in config) {
    if (config.error.includes("חסרות")) {
      return {
        rows: SAMPLE_ROWS,
        warnings: ["מצב הדגמה — מוצגות שורות לדוגמה בלבד."],
        source: "mock",
      };
    }
    return {
      rows: [],
      warnings: [config.error],
      source: "mock",
    };
  }

  const sheets = await getSheetsClient(config.credentials, "readonly");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: config.range,
  });

  const parsed = parseSheetGrid(res.data.values);
  return {
    rows: parsed.rows,
    warnings: parsed.warnings,
    source: "sheet",
  };
}

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

function fileEntryToResult(
  entry: FileCacheEntry,
  cacheHit: boolean,
): SheetFetchResult {
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

async function fetchFromGoogleSheets(
  bypassCache = false,
): Promise<SheetFetchResult> {
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

async function getCachedSheetData(
  bypassCache = false,
): Promise<SheetFetchResult> {
  "use cache";
  cacheTag("codes");
  cacheLife("minutes");

  return fetchFromGoogleSheets(bypassCache);
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
