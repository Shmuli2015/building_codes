import type { AuthorizedUser } from "./auth-types";
import { parseAuthorizedSheetRows } from "./auth-sheet";
import { getAuthSheetConfig, getSheetsClient } from "./google-sheets";

const DEFAULT_TTL_MS = 180_000;

type EmailCacheEntry = {
  users: AuthorizedUser[];
  expiresAt: number;
};

let emailCache: EmailCacheEntry | null = null;

function ttlMs(): number {
  const raw = process.env.CODES_CACHE_TTL_MS;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_TTL_MS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TTL_MS;
}

export function clearEmailCache() {
  emailCache = null;
}

export async function getAuthorizedUsers(): Promise<AuthorizedUser[]> {
  const now = Date.now();
  const ttl = ttlMs();

  if (emailCache && emailCache.expiresAt > now) {
    return emailCache.users;
  }

  const config = getAuthSheetConfig();
  if ("error" in config) {
    if (config.error.includes("חסרות")) {
      const devEmail = process.env.AUTH_ALLOWLIST_DEV_EMAIL || "";
      const users = devEmail
        ? [{ email: devEmail.toLowerCase(), name: "" }]
        : [];
      emailCache = { users, expiresAt: now + ttl };
      return users;
    }
    return [];
  }

  try {
    const sheets = await getSheetsClient(config.credentials, "readonly");
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: config.range,
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
