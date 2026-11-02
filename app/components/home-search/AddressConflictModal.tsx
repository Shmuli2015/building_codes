"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { AddressMatch } from "@/lib/sheet-actions";
import { ConflictChooseStep } from "./ConflictChooseStep";
import { ConflictPickRowStep } from "./ConflictPickRowStep";
import { formatAddress } from "./helpers/formatAddress";

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
              <p className="mt-2 text-center text-sm text-slate-600">
                {addressLabel}
              </p>
            </div>

            {step === "choose" ? (
              <ConflictChooseStep
                matches={matches}
                processing={processing}
                onChooseEdit={onChooseEdit}
                onChooseAddNew={onChooseAddNew}
              />
            ) : (
              <ConflictPickRowStep
                matches={matches}
                selectedSheetRowIndex={selectedSheetRowIndex}
                processing={processing}
                onSelectRow={onSelectRow}
                onConfirmEdit={onConfirmEdit}
                onBack={onBack}
              />
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
