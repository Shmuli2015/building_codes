"use client";

import { KeyRound, SearchX } from "lucide-react";

type Props = {
  hasFilters: boolean;
  onResetFilters: () => void;
};

export function CodesEmptyState({ hasFilters, onResetFilters }: Props) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/60 px-6 py-14 text-center shadow-xs backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="mt-4 text-base font-bold text-slate-800">
          לא נמצאו תוצאות לסינון הנוכחי
        </p>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          נסה לשנות את מונח החיפוש או לבחור שכונה / סוג אחרים.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          איפוס כל הסינונים
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/60 px-6 py-14 text-center shadow-xs backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <KeyRound className="h-6 w-6" />
      </div>
      <p className="mt-4 text-base font-bold text-slate-800">
        אין קודים זמינים במערכת
      </p>
      <p className="mt-1 text-xs text-slate-500">
        לא נמצאו שורות תקינות בגיליון.
      </p>
    </div>
  );
}
