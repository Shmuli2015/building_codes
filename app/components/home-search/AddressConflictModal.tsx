"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { AddressMatch } from "@/lib/sheet-actions";

export type ConflictStep = "choose" | "pickRow";

type Props = {
  open: boolean;
  step: ConflictStep;
  matches: AddressMatch[];
  street: string;
  houseNumber: string;
  area?: string;
  selectedSheetRowIndex: number | null;
  processing?: boolean;
  onClose: () => void;
  onChooseEdit: () => void;
  onChooseAddNew: () => void;
  onSelectRow: (sheetRowIndex: number) => void;
  onConfirmEdit: () => void;
  onBack: () => void;
};

function formatAddress(street: string, houseNumber: string, area?: string): string {
  const base = `${street} ${houseNumber}`;
  return area?.trim() ? `${area.trim()} · ${base}` : base;
}

export function AddressConflictModal({
  open,
  step,
  matches,
  street,
  houseNumber,
  area,
  selectedSheetRowIndex,
  processing = false,
  onClose,
  onChooseEdit,
  onChooseAddNew,
  onSelectRow,
  onConfirmEdit,
  onBack,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || matches.length === 0) return null;

  const addressLabel = formatAddress(street, houseNumber, area);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <m.button
            type="button"
            aria-label="סגור"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            disabled={processing}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm disabled:cursor-not-allowed"
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-conflict-modal-title"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, y: 10 }
            }
            className="relative z-10 flex max-h-[min(85dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="shrink-0 border-b border-slate-100 px-6 py-5">
              <h3
                id="address-conflict-modal-title"
                className="text-center text-lg font-bold text-slate-900"
              >
                {step === "choose" ? "כתובת קיימת במערכת" : "בחירת קוד לעריכה"}
              </h3>
              <p className="mt-2 text-center text-sm text-slate-600">{addressLabel}</p>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
              {step === "choose" ? (
                <>
                  <p className="mb-4 text-center text-sm text-slate-600">
                    נמצאו {matches.length} קוד{matches.length === 1 ? "" : "ים"} קיימים בכתובת זו.
                    מה ברצונך לעשות?
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
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-6 py-4">
              {step === "choose" ? (
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
              ) : (
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
              )}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
