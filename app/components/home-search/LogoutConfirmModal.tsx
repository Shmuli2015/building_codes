"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ open, onClose, onConfirm }: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="סגור"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
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
            className="relative z-10 w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3
              id="logout-modal-title"
              className="mb-2 text-center text-lg font-bold text-slate-900"
            >
              התנתקות מהמערכת
            </h3>
            <p className="mb-6 text-center text-sm text-slate-600">
              האם אתה בטוח שברצונך להתנתק?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/20 transition-colors hover:bg-red-700"
              >
                התנתק
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
