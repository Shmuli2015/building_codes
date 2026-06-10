import { NextRequest, NextResponse } from "next/server";

import { buildSearchIndex } from "@/lib/search-index";
import { getCodes } from "@/lib/sheet-cache";

function cacheControlHeader(): string {
  const raw = process.env.CODES_CACHE_TTL_MS;
  const ttl = raw ? Number.parseInt(raw, 10) : 180_000;
  const maxAge = Number.isFinite(ttl) && ttl > 0 ? Math.floor(ttl / 1000) : 180;
  const swr = Math.max(30, Math.floor(maxAge / 3));
  return `private, max-age=${maxAge}, stale-while-revalidate=${swr}`;
}

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    const payload = await getCodes({ bypassCache: refresh });
    return NextResponse.json(
      {
        index: buildSearchIndex(payload.rows),
        warnings: payload.warnings,
        source: payload.source,
        cacheExpiresAt: payload.cacheExpiresAt,
        cacheHit: payload.cacheHit,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": cacheControlHeader(),
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה בטעינת הנתונים";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
