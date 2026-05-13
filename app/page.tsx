import { getCodes } from "@/lib/sheet-cache";

import HomeSearch from "./components/HomeSearch";

export default async function Home() {
  const data = await getCodes({ bypassCache: false });
  const initial = {
    rows: data.rows,
    warnings: data.warnings,
    source: data.source,
    cacheExpiresAt: data.cacheExpiresAt,
    cacheHit: data.cacheHit,
    fetchedAt: new Date().toISOString(),
  };

  return <HomeSearch initial={initial} />;
}
