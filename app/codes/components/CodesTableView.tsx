"use client";

import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import type { CodeWithIndex } from "@/lib/sheet-actions";

type Props = {
  rows: CodeWithIndex[];
  copiedKey: string | null;
  copyFailedKey: string | null;
  onCopy: (code: string, rowKey: string) => void;
  onAreaSelect?: (area: string) => void;
  onKindSelect?: (kind: string) => void;
  onEdit: (row: CodeWithIndex) => void;
  onDelete: (row: CodeWithIndex) => void;
};

export function CodesTableView({
  rows,
  copiedKey,
  copyFailedKey,
  onCopy,
  onAreaSelect,
  onKindSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
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
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => {
                const rowKey = `${row.street}-${row.number}-${row.code}-${idx}`;
                const isCopied = copiedKey === rowKey;
                const isFailed = copyFailedKey === rowKey;

                return (
                  <tr
                    key={rowKey}
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {row.area ? (
                        <button
                          type="button"
                          onClick={() => onAreaSelect?.(row.area)}
                          className="rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
                        >
                          {row.area}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900">
                      {row.street} {row.number}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {row.kind ? (
                        <button
                          type="button"
                          onClick={() => onKindSelect?.(row.kind)}
                          className="inline-flex rounded-lg border border-blue-200/70 bg-blue-50/80 px-2 py-0.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          {row.kind}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
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
                    <td className="max-w-xs px-4 py-3.5 text-xs text-slate-600 break-words">
                      {row.note || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row, idx) => {
          const rowKey = `${row.street}-${row.number}-${row.code}-${idx}`;
          const isCopied = copiedKey === rowKey;
          const isFailed = copyFailedKey === rowKey;

          return (
            <div
              key={rowKey}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm ring-1 ring-white/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-slate-900">
                    {row.street} {row.number}
                  </p>
                  {row.area ? (
                    <button
                      type="button"
                      onClick={() => onAreaSelect?.(row.area)}
                      className="mt-0.5 inline-block text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      {row.area}
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  {row.kind ? (
                    <button
                      type="button"
                      onClick={() => onKindSelect?.(row.kind)}
                      className="shrink-0 rounded-lg border border-blue-200/70 bg-blue-50/80 px-2 py-0.5 text-xs font-semibold text-blue-700"
                    >
                      {row.kind}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                    aria-label="ערוך"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="מחק"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-2.5">
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
                <p className="mt-2.5 text-xs text-slate-500 break-words">
                  {row.note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
