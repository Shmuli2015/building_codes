"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, RotateCw } from "lucide-react";

type Props = {
  totalCount: number;
  filteredCount: number;
  onAddCodeClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function CodesHeader({
  totalCount,
  filteredCount,
  onAddCodeClick,
  onRefresh,
  isRefreshing = false,
}: Props) {
  const isFiltered = filteredCount !== totalCount;

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-2.5 py-1.5 shadow-[var(--shadow-card)] ring-1 ring-white/50 backdrop-blur-md sm:gap-3 sm:px-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white active:scale-95 sm:gap-1.5 sm:px-2.5"
            aria-label="חזרה לחיפוש"
          >
            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">חזרה לחיפוש</span>
            <span className="sm:hidden">חזרה</span>
          </Link>

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white active:scale-95 disabled:opacity-50 sm:gap-1.5 sm:px-2.5"
              aria-label={isRefreshing ? "מרענן נתונים..." : "רענון נתונים"}
              title="רענון נתונים מהגיליון"
            >
              <RotateCw
                className={`h-3.5 w-3.5 text-slate-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                aria-hidden
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "מרענן..." : "רענון"}
              </span>
            </button>
          ) : null}

          {onAddCodeClick ? (
            <button
              type="button"
              onClick={onAddCodeClick}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200/70 bg-blue-50/80 px-2 py-1.5 text-xs font-medium text-blue-700 shadow-xs backdrop-blur-sm transition-colors hover:border-blue-300 hover:bg-blue-100/70 active:scale-95 sm:gap-1.5 sm:px-2.5"
              aria-label="הוספת קוד"
            >
              <KeyRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">הוספת קוד</span>
              <span className="sm:hidden">הוספה</span>
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-2 py-1 text-xs text-slate-600 whitespace-nowrap sm:px-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
          <span className="font-medium">
            {isFiltered ? (
              <>
                <span className="hidden sm:inline">
                  מציג {filteredCount} מתוך {totalCount} קודים
                </span>
                <span className="sm:hidden">
                  {filteredCount}/{totalCount} קודים
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">סה״כ {totalCount} קודים</span>
                <span className="sm:hidden">{totalCount} קודים</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="px-1 text-start">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          רשימת{" "}
          <span className="bg-linear-to-l from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            כל הקודים
          </span>
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          מאגר קודי כניסה לבניינים
        </p>
      </div>
    </header>
  );
}
