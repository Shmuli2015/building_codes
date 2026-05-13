"use client";

import type { RefObject } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BuildingCodeRow } from "@/lib/building-codes";

import { CloseIcon } from "./icons";
import { ResultMatchCard } from "./ResultMatchCard";
import { springSnappy } from "./motion-config";

type Props = {
  open: boolean;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  street: string;
  houseNumber: string;
  matches: BuildingCodeRow[];
  copiedRowKey: string | null;
  failedCopyKey: string | null;
  onCopy: (code: string, rowKey: string) => void;
};

export function ResultModal({
  open,
  onClose,
  closeButtonRef,
  street,
  houseNumber,
  matches,
  copiedRowKey,
  failedCopyKey,
  onCopy,
}: Props) {
  const reduceMotion = useReducedMotion();

  const backdropTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion
    ? { duration: 0.18 }
    : springSnappy;

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          key="result-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <motion.button
            type="button"
            aria-label="סגור"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-modal-title"
            className="relative z-10 max-h-[min(85vh,40rem)] w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-linear-to-b from-white to-slate-50/95 shadow-2xl shadow-indigo-950/30 ring-1 ring-blue-500/10"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 48, scale: 0.92, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.96, filter: "blur(4px)" }
            }
            transition={panelTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100/90 bg-linear-to-l from-blue-50/80 via-white to-indigo-50/50 px-4 py-4 sm:px-5">
              <h2
                id="result-modal-title"
                className="bg-linear-to-l from-slate-900 to-indigo-900 bg-clip-text text-lg font-bold text-transparent"
              >
                תוצאת חיפוש
              </h2>
              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 90 }}
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="סגור חלון"
              >
                <CloseIcon className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="max-h-[min(75vh,32rem)] overflow-y-auto px-4 py-5 sm:px-6">
              {!street.trim() || !houseNumber.trim() ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm font-medium text-slate-600"
                >
                  נא למלא לפחות <strong>רחוב</strong> ו<strong>מספר בית</strong>{" "}
                  כדי לחפש.
                </motion.p>
              ) : matches.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={panelTransition}
                  className="text-center text-sm font-medium text-slate-600"
                >
                  לא נמצאה התאמה לכתובת זו ברשימה.
                </motion.p>
              ) : (
                <ul className="space-y-4">
                  {matches.map((row, idx) => {
                    const rowKey = `${row.area}-${row.street}-${row.number}-${row.code}-${idx}`;
                    return (
                      <ResultMatchCard
                        key={rowKey}
                        row={row}
                        index={idx}
                        copied={copiedRowKey === rowKey}
                        copyFailed={failedCopyKey === rowKey}
                        onCopy={() => onCopy(row.code, rowKey)}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
