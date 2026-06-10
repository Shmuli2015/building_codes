import { Suspense } from "react";

import { buildSearchIndex } from "@/lib/search-index";
import { getCodes } from "@/lib/sheet-cache";

import HomeSearch from "./components/HomeSearch";

async function HomeSearchLoader() {
  const data = await getCodes({ bypassCache: false });
  const initial = {
    index: buildSearchIndex(data.rows),
    warnings: data.warnings,
    source: data.source,
    cacheExpiresAt: data.cacheExpiresAt,
    cacheHit: data.cacheHit,
    fetchedAt: new Date().toISOString(),
  };

  return <HomeSearch initial={initial} />;
}

function HomeSearchFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 text-sm text-slate-500">
      טוען נתונים…
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSearchFallback />}>
      <HomeSearchLoader />
    </Suspense>
  );
}
