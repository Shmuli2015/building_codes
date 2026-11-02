import type { CodeWithIndex } from "@/lib/sheet-actions";

export type AllCodesViewProps = {
  initialRows: CodeWithIndex[];
  warnings: string[];
  addCodeEnabled?: boolean;
};

export type CodeSortOption = "street" | "area";

export type CodeFilterState = {
  searchQuery: string;
  selectedArea: string;
  selectedKind: string;
  sortBy: CodeSortOption;
};

export type FilterOptions = {
  areas: string[];
  kinds: string[];
};
