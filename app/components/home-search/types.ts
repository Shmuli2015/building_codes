import type { BuildingCodeRow } from "@/lib/building-codes";

export type CodesClientPayload = {
  rows: BuildingCodeRow[];
  warnings: string[];
  source: "sheet" | "mock";
  cacheExpiresAt: number;
  cacheHit: boolean;
  fetchedAt: string;
};

export type ApiResponse = CodesClientPayload & { error?: string };

export type HomeSearchProps = {
  initial: CodesClientPayload;
};
