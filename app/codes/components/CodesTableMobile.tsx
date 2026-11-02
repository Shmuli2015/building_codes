"use client";

import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import type { CodeWithIndex } from "@/lib/sheet-actions";
import type { GroupedAddress } from "../types";
import { getCodeFallbackLabel } from "../helpers/groupCodes";
import { CodeKindBadge } from "./CodeKindBadge";

type Props = {
  groups: GroupedAddress[];
  copiedKey: string | null;
  copyFailedKey: string | null;
  onCopy: (code: string, rowKey: string) => void;
  onAreaSelect?: (area: string) => void;
  onKindSelect?: (kind: string) => void;
  onEdit: (row: CodeWithIndex) => void;
  onDelete: (row: CodeWithIndex) => void;
};

export function CodesTableMobile({
  groups,
  copiedKey,
  copyFailedKey,
  onCopy,
  onAreaSelect,
  onKindSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {groups.map((group) => {
        const hasMultiple = group.codes.length > 1;

        return (
          <div
            key={group.key}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm ring-1 ring-white/60"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base font-bold text-slate-900">
                    {group.street} {group.number}
                  </p>
                  {hasMultiple ? (
                    <span className="shrink-0 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {group.codes.length} קודים
                    </span>
                  ) : null}
                </div>
                {group.area ? (
                  <button
                    type="button"
                    onClick={() => onAreaSelect?.(group.area)}
                    className="mt-0.5 inline-block text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {group.area}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {group.codes.map((row, idx) => {
                const rowKey = `${row.street}-${row.number}-${row.code}-${row.sheetRowIndex}`;
                const isCopied = copiedKey === rowKey;
                const isFailed = copyFailedKey === rowKey;
                const fallbackLabel = getCodeFallbackLabel(
                  idx,
                  group.codes.length,
                );

                return (
                  <div key={rowKey} className={idx > 0 ? "pt-3.5 mt-3.5" : "pt-3"}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <CodeKindBadge
                          kind={row.kind}
                          fallbackLabel={fallbackLabel}
                          onKindSelect={onKindSelect}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                          aria-label="ערוך"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                          aria-label="מחק"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-2.5">
                      <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">
                        {row.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy(row.code, rowKey)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors ${
                          isCopied
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : isFailed
                              ? "border-red-300 bg-red-50 text-red-800"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                        aria-label={`העתק קוד ${row.code}`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>הועתק</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 text-slate-500" />
                            <span>העתק קוד</span>
                          </>
                        )}
                      </button>
                    </div>

                    {row.note ? (
                      <p className="mt-2 text-xs text-slate-500 break-words">
                        {row.note}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

