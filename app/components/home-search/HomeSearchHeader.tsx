"use client";

import { motion, useReducedMotion } from "framer-motion";

import { MapPinIcon } from "./icons";

export function HomeSearchHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="text-center sm:text-start">
      <motion.div
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-linear-to-l from-blue-50/95 to-indigo-50/90 px-4 py-1.5 text-sm font-medium text-blue-900 shadow-md shadow-blue-600/10 ring-1 ring-white/60"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <motion.span
          aria-hidden
          className="flex"
          animate={
            reduceMotion ? undefined : { y: [0, -2, 0] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPinIcon className="h-4 w-4 text-blue-600" />
        </motion.span>
        קוד כניסה לפי כתובת
      </motion.div>
      <motion.h1
        className="text-balance bg-linear-to-l from-slate-900 via-blue-900 to-indigo-950 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        חיפוש קוד בניין
      </motion.h1>
      <p className="mx-auto mt-3 max-w-md text-pretty text-base leading-relaxed text-slate-600 sm:mx-0">
        הזינו את שם הרחוב ומספר הבית כדי לקבל את קוד הכניסה.
      </p>
    </header>
  );
}
