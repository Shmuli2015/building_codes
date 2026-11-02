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

export function CodesTableDesktop({
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
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[var(--shadow-card)] ring-1 ring-white/60 backdrop-blur-md md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-slate-200/70 bg-slate-50/80 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">שכונה</th>
              <th className="px-4 py-3.5 whitespace-nowrap">כתובת ומספר</th>
              <th className="px-4 py-3.5 whitespace-nowrap">סוג</th>
              <th className="px-4 py-3.5 whitespace-nowrap">קוד כניסה</th>
              <th className="px-4 py-3.5">הערה</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {groups.map((group) => {
              const rowSpan = group.codes.length;

              return group.codes.map((row, idx) => {
                const rowKey = `${row.street}-${row.number}-${row.code}-${row.sheetRowIndex}`;
                const isCopied = copiedKey === rowKey;
                const isFailed = copyFailedKey === rowKey;
                const isFirst = idx === 0;
                const isLast = idx === group.codes.length - 1;
                const borderClass = isLast
                  ? "border-b border-slate-200/80"
                  : "border-b border-dashed border-slate-200/60";

                return (
                  <tr
                    key={rowKey}
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    {isFirst ? (
                      <td
                        rowSpan={rowSpan}
                        className="border-b border-slate-200/80 px-4 py-3.5 align-top whitespace-nowrap bg-white/40"
                      >
                        {group.area ? (
                          <button
                            type="button"
                            onClick={() => onAreaSelect?.(group.area)}
                            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
                          >
                            {group.area}
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    ) : null}

                    {isFirst ? (
                      <td
                        rowSpan={rowSpan}
                        className="border-b border-slate-200/80 px-4 py-3.5 align-top whitespace-nowrap bg-white/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {group.street} {group.number}
                          </span>
                          {group.codes.length > 1 ? (
                            <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              {group.codes.length} קודים
                            </span>
                          ) : null}
                        </div>
                      </td>
                    ) : null}

                    <td className={`px-4 py-3.5 whitespace-nowrap ${borderClass}`}>
                      <CodeKindBadge
                        kind={row.kind}
                        fallbackLabel={getCodeFallbackLabel(
                          idx,
                          group.codes.length,
                        )}
                        onKindSelect={onKindSelect}
                      />
                    </td>

                    <td className={`px-4 py-3.5 whitespace-nowrap ${borderClass}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold tracking-wider text-slate-900">
                          {row.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => onCopy(row.code, rowKey)}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                            isCopied
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : isFailed
                                ? "border-red-300 bg-red-50 text-red-800"
                                : "border-slate-200 bg-white text-slate-700 opacity-80 group-hover:opacity-100 hover:bg-slate-50"
                          }`}
                          aria-label={`העתק קוד ${row.code}`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>הועתק</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-500" />
                              <span>העתק</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    <td
                      className={`max-w-xs px-4 py-3.5 text-xs text-slate-600 break-words ${borderClass}`}
                    >
                      {row.note || "-"}
                    </td>

                    <td
                      className={`px-4 py-3.5 text-center whitespace-nowrap ${borderClass}`}
                    >
                      <div className="inline-flex items-center gap-1 opacity-75 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                          aria-label={`ערוך קוד עבור ${row.street} ${row.number}`}
                          title="ערוך קוד"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`מחק קוד עבור ${row.street} ${row.number}`}
                          title="מחק קוד"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

