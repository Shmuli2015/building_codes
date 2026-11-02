"use client";

import { Users, UserX } from "lucide-react";

type Props = {
  isFiltered: boolean;
  onClearFilters: () => void;
};

export function AuthorizedEmptyState({ isFiltered, onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center backdrop-blur-sm">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {isFiltered ? (
          <UserX className="h-6 w-6" aria-hidden />
        ) : (
          <Users className="h-6 w-6" aria-hidden />
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-800">
        {isFiltered ? "לא נמצאו מורשים התואמים לחיפוש" : "אין מורשים ברשימה"}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
        {isFiltered
          ? "נסה לשנות את מונח החיפוש או לנקות את הסינון כדי לראות את כל המורשים."
          : "הוסף מורשה חדש באמצעות הטופס למעלה כדי לאפשר גישה למערכת."}
      </p>

      {isFiltered && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 inline-flex items-center rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
        >
          איפוס חיפוש
        </button>
      )}
    </div>
  );
}

