import { Suspense } from "react";


import { getCodes } from "@/lib/sheet-cache";
import { getSession } from "@/lib/auth-actions";

import HomeSearch from "./components/HomeSearch";

async function HomeSearchLoader() {
  const [data, session] = await Promise.all([
    getCodes({ bypassCache: false }),
    getSession(),
  ]);
  const initial = {
    index: data.index,
    warnings: data.warnings,
    source: data.source,
    cacheExpiresAt: data.cacheExpiresAt,
    cacheHit: data.cacheHit,
    fetchedAt: new Date().toISOString(),
  };

  return (
    <HomeSearch
      initial={initial}
      addCodeEnabled={Boolean(process.env.ADD_CODE_PASSWORD)}
      addAuthorizedEnabled={Boolean(process.env.ADD_AUTHORIZED_PASSWORD)}
      currentUserEmail={session?.email ?? null}
    />
  );
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
