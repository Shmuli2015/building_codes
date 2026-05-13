import { NextRequest, NextResponse } from "next/server";

import { getCodes } from "@/lib/sheet-cache";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    const payload = await getCodes({ bypassCache: refresh });
    return NextResponse.json({
      ...payload,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה בטעינת הנתונים";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
