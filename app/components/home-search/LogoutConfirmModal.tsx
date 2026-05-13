"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ open, onClose, onConfirm }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 pointer-events-auto"
            >
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                התנתקות מהמערכת
              </h3>
              <p className="text-slate-600 text-center text-sm mb-6">
                האם אתה בטוח שברצונך להתנתק?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  התנתק
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
