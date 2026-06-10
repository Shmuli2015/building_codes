"use client";

import { m, useReducedMotion } from "framer-motion";

import { springSnappy } from "./motion-config";

export function HomeSearchHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="text-start"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0.2 } : springSnappy}
    >
      <h1 className="font-display text-balance text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
        חיפוש{" "}
        <span className="bg-linear-to-l from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          קוד בניין
        </span>
      </h1>
      <p className="mt-0.5 text-sm leading-snug text-slate-500">
        לפי רחוב, מספר בית ושכונה (אופציונלי)
      </p>
    </m.div>
  );
}
