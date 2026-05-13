"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MapPinIcon } from "./icons";

export function HomeSearchHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="text-center sm:text-start">
      <motion.div
        className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-[var(--shadow-card)] ring-1 ring-white/55 backdrop-blur-md"
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      >
        <motion.span
          aria-hidden
          className="flex text-blue-600"
          animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPinIcon className="h-4 w-4 shrink-0" />
        </motion.span>
        קוד כניסה לפי כתובת
      </motion.div>
      <motion.h1
        className="font-display text-balance bg-linear-to-l from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-[1.75rem] font-semibold leading-tight tracking-tight text-transparent sm:text-4xl sm:leading-snug"
        initial={{ opacity: 0.92 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65 }}
      >
        חיפוש{" "}
        <span className="bg-linear-to-l from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          קוד בניין
        </span>
      </motion.h1>
      <p className="mx-auto mt-2.5 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-slate-600 sm:mx-0 sm:text-base">
        הזינו רחוב, מספר בית ובמידת הצורך גם שכונה ותקבלו את קוד הכניסה אם הוא
        מופיע ברשימה.
      </p>
    </header>
  );
}
