"use client";

import { AnimatePresence, m } from "framer-motion";

type Props = {
  warnings: string[];
};

export function WarningsBanner({ warnings }: Props) {
  return (
    <AnimatePresence mode="wait">
      {warnings.length > 0 ? (
        <m.ul
          key="warnings"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="space-y-1.5 overflow-hidden rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-md shadow-amber-900/10"
        >
          {warnings.map((w, i) => (
            <m.li
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="leading-relaxed"
            >
              {w}
            </m.li>
          ))}
        </m.ul>
      ) : null}
    </AnimatePresence>
  );
}
