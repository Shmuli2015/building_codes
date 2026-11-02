"use client";

import Link from "next/link";
import { ArrowRight, List, Lock, RotateCw } from "lucide-react";

type Props = {
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLock: () => void;
};

export function AuthorizedHeader({
  totalCount,
  filteredCount,
  onRefresh,
  isRefreshing,
  onLock,
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
            <span className="sm:hidden">חיפוש</span>
          </Link>

          <Link
            href="/codes"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white active:scale-95 sm:gap-1.5 sm:px-2.5"
            aria-label="כל הקודים"
          >
            <List className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">כל הקודים</span>
            <span className="sm:hidden">קודים</span>
          </Link>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white active:scale-95 disabled:opacity-50 sm:gap-1.5 sm:px-2.5"
            aria-label={isRefreshing ? "מרענן נתונים..." : "רענון נתונים"}
            title="רענון רשימת המורשים"
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

          <button
            type="button"
            onClick={onLock}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white active:scale-95 sm:gap-1.5 sm:px-2.5"
            aria-label="נעילת מסך"
            title="נעילה וחזרה לאימות קוד"
          >
            <Lock className="h-3.5 w-3.5 text-slate-600" aria-hidden />
            <span className="hidden sm:inline">נעילה</span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-2 py-1 text-xs text-slate-600 whitespace-nowrap sm:px-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
          <span className="font-medium">
            {isFiltered ? (
              <>
                <span className="hidden sm:inline">
                  מציג {filteredCount} מתוך {totalCount} מורשים
                </span>
                <span className="sm:hidden">
                  {filteredCount}/{totalCount} מורשים
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">סה״כ {totalCount} מורשים</span>
                <span className="sm:hidden">{totalCount} מורשים</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="px-1 text-start">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          ניהול{" "}
          <span className="bg-linear-to-l from-indigo-600 to-blue-700 bg-clip-text text-transparent">
            משתמשים מורשים
          </span>
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          צפייה, הוספה ומחיקה של משתמשים בעלי גישה מורשית למערכת
        </p>
      </div>
    </header>
  );
}

