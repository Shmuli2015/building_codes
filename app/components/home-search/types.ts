import type { SearchIndex } from "@/lib/search-index";

export type CodesClientPayload = {
  index: SearchIndex;
  warnings: string[];
  source: "sheet" | "mock";
  cacheExpiresAt: number;
  cacheHit: boolean;
  fetchedAt: string;
};

export type ApiResponse = CodesClientPayload & { error?: string };

export type SearchApiResponse = {
  matches: import("@/lib/building-codes").BuildingCodeRow[];
  error?: string;
};

export type HomeSearchProps = {
  initial: CodesClientPayload;
  addCodeEnabled?: boolean;
  addAuthorizedEnabled?: boolean;
  currentUserEmail?: string | null;
};

