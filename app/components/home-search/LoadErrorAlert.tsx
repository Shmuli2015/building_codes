"use client";

import { AnimatePresence, m } from "framer-motion";

type Props = {
  message: string | null;
};

export function LoadErrorAlert({ message }: Props) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <m.div
          key="load-error"
          role="alert"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm font-medium text-red-900 shadow-lg shadow-red-900/10"
        >
          {message}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
