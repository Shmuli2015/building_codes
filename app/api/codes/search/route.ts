import { NextRequest, NextResponse } from "next/server";

import { filterRowsWithIndex } from "@/lib/search-index";
import { getCodes } from "@/lib/sheet-cache";

export async function GET(request: NextRequest) {
  const street = request.nextUrl.searchParams.get("street") ?? "";
  const number = request.nextUrl.searchParams.get("number") ?? "";
  const area = request.nextUrl.searchParams.get("area") ?? undefined;

  if (!street.trim() || !number.trim()) {
    return NextResponse.json(
      { error: "חסרים רחוב או מספר בית" },
      { status: 400 },
    );
  }

  try {
    const payload = await getCodes({ bypassCache: false });
    const matches = filterRowsWithIndex(
      payload.rows,
      payload.index,
      street,
      number,
      area,
    );

    return NextResponse.json(
      { matches },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה בחיפוש";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
