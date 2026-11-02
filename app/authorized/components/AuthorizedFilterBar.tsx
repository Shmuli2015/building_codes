"use client";

import { Search, X } from "lucide-react";
import { ADDRESS_INPUT_CLASS } from "@/app/components/home-search/constants";

type Props = {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClear: () => void;
};

export function AuthorizedFilterBar({
  searchQuery,
  onSearchChange,
  onClear,
}: Props) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Search className="h-4 w-4" aria-hidden />
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="חיפוש מורשה לפי שם או אימייל..."
        className={`${ADDRESS_INPUT_CLASS} pr-10 pl-10`}
        aria-label="חיפוש מורשה"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={onClear}
          className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="נקה חיפוש"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

