"use client";

import type { AddressMatch } from "@/lib/sheet-actions";

type Props = {
  matches: AddressMatch[];
  processing: boolean;
  onChooseEdit: () => void;
  onChooseAddNew: () => void;
};

export function ConflictChooseStep({
  matches,
  processing,
  onChooseEdit,
  onChooseAddNew,
}: Props) {
  return (
    <>
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
        <p className="mb-4 text-center text-sm text-slate-600">
          נמצאו {matches.length} קוד{matches.length === 1 ? "" : "ים"} קיימים
          בכתובת זו. מה ברצונך לעשות?
        </p>
        <ul className="space-y-2" aria-label="קודים קיימים">
          {matches.map((match) => (
            <li
              key={match.sheetRowIndex}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-800">
                  {match.row.kind || "ללא סוג"}
                </span>
                <span className="font-mono font-semibold tracking-wider text-slate-900">
                  {match.row.code}
                </span>
              </div>
              {match.row.note ? (
                <p className="mt-1 text-xs text-slate-500">{match.row.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 border-t border-slate-100 px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onChooseAddNew}
            disabled={processing}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "שומר..." : "הוסף קוד חדש"}
          </button>
          <button
            type="button"
            onClick={onChooseEdit}
            disabled={processing}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ערוך קוד קיים
          </button>
        </div>
      </div>
    </>
  );
}
