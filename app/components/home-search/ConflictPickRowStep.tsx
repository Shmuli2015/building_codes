"use client";

import type { AddressMatch } from "@/lib/sheet-actions";

type Props = {
  matches: AddressMatch[];
  selectedSheetRowIndex: number | null;
  processing: boolean;
  onSelectRow: (sheetRowIndex: number) => void;
  onConfirmEdit: () => void;
  onBack: () => void;
};

export function ConflictPickRowStep({
  matches,
  selectedSheetRowIndex,
  processing,
  onSelectRow,
  onConfirmEdit,
  onBack,
}: Props) {
  return (
    <>
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
        <p className="mb-4 text-center text-sm text-slate-600">
          בחר איזה קוד לעדכן לפי הערכים שהזנת בטופס:
        </p>
        <fieldset className="space-y-2">
          <legend className="sr-only">בחירת קוד לעריכה</legend>
          {matches.map((match) => {
            const inputId = `conflict-row-${match.sheetRowIndex}`;
            const checked = selectedSheetRowIndex === match.sheetRowIndex;
            return (
              <label
                key={match.sheetRowIndex}
                htmlFor={inputId}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  checked
                    ? "border-blue-300 bg-blue-50/80"
                    : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="conflict-row"
                  className="mt-1 shrink-0"
                  checked={checked}
                  disabled={processing}
                  onChange={() => onSelectRow(match.sheetRowIndex)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">
                      {match.row.kind || "ללא סוג"}
                    </span>
                    <span className="font-mono font-semibold tracking-wider text-slate-900">
                      {match.row.code}
                    </span>
                  </span>
                  {match.row.note ? (
                    <span className="mt-1 block text-xs text-slate-500">
                      {match.row.note}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>

      <div className="shrink-0 border-t border-slate-100 px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            חזרה
          </button>
          <button
            type="button"
            onClick={onConfirmEdit}
            disabled={processing || selectedSheetRowIndex == null}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "מעדכן..." : "עדכן"}
          </button>
        </div>
      </div>
    </>
  );
}
