"use client";

import { useMemo } from "react";
import { ArrowUpDown, MapPin, RotateCcw, Search, Tag, X } from "lucide-react";
import type { CodeSortOption, FilterOptions } from "../types";
import { CustomSelect, type SelectOption } from "./CustomSelect";

type Props = {
  searchQuery: string;
  selectedArea: string;
  selectedKind: string;
  sortBy: CodeSortOption;
  filterOptions: FilterOptions;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onAreaChange: (area: string) => void;
  onKindChange: (kind: string) => void;
  onSortChange: (sort: CodeSortOption) => void;
  onResetFilters: () => void;
};

export function CodesFilterBar({
  searchQuery,
  selectedArea,
  selectedKind,
  sortBy,
  filterOptions,
  hasActiveFilters,
  onSearchChange,
  onAreaChange,
  onKindChange,
  onSortChange,
  onResetFilters,
}: Props) {
  const areaOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "כל השכונות" },
      ...filterOptions.areas.map((a) => ({ value: a, label: a })),
    ],
    [filterOptions.areas],
  );

  const kindOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "כל הסוגים" },
      ...filterOptions.kinds.map((k) => ({ value: k, label: k })),
    ],
    [filterOptions.kinds],
  );

  return (
    <div className="relative z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[var(--shadow-card)] ring-1 ring-white/60 backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש חופשי לפי רחוב, מספר, קוד או הערה..."
            className="w-full rounded-xl border border-slate-200/80 bg-white/95 py-2.5 pr-10 pl-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-slate-600"
              aria-label="נקה טקסט חיפוש"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
          <CustomSelect
            value={selectedArea}
            placeholder="כל השכונות"
            options={areaOptions}
            icon={<MapPin className="h-3.5 w-3.5" />}
            onChange={onAreaChange}
          />
          <CustomSelect
            value={selectedKind}
            placeholder="כל הסוגים"
            options={kindOptions}
            icon={<Tag className="h-3.5 w-3.5" />}
            onChange={onKindChange}
          />
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 p-1 text-xs text-slate-600">
            <ArrowUpDown className="mr-1 h-3.5 w-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onSortChange("street")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                sortBy === "street"
                  ? "bg-blue-50 text-blue-700 shadow-xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              לפי רחוב
            </button>
            <button
              type="button"
              onClick={() => onSortChange("area")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                sortBy === "area"
                  ? "bg-blue-50 text-blue-700 shadow-xs"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              לפי שכונה
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            >
              <RotateCcw className="h-3 w-3" />
              <span>איפוס</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
