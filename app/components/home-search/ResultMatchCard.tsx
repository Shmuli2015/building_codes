"use client";

import type { BuildingCodeRow } from "@/lib/building-codes";

import { motion, useReducedMotion } from "framer-motion";

import { springSnappy } from "./motion-config";
import { CopyIcon } from "./icons";

type Props = {
  row: BuildingCodeRow;
  index: number;
  copied: boolean;
  copyFailed: boolean;
  onCopy: () => void;
};

export function ResultMatchCard({
  row,
  index,
  copied,
  copyFailed,
  onCopy,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      layout
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        ...springSnappy,
        delay: reduceMotion ? 0 : index * 0.07,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-linear-to-br from-white/95 to-slate-50/90 p-5 shadow-lg shadow-slate-900/10 ring-1 ring-white/80"
    >
      <div className="absolute inset-y-0 right-0 w-1 bg-linear-to-b from-blue-500 to-indigo-600 opacity-95" />
      <div className="pr-3">
        <p className="text-sm font-medium text-slate-600">
          {row.area ? `${row.area} · ` : ""}
          {row.street} {row.number}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
          <motion.p
            className="min-w-0 break-all font-mono text-3xl font-bold tracking-[0.15em] text-slate-900 sm:text-4xl"
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              ...springSnappy,
              delay: reduceMotion ? 0 : 0.05 + index * 0.07,
            }}
          >
            {row.code}
          </motion.p>
          <motion.button
            type="button"
            onClick={onCopy}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={`inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/25 sm:self-center ${
              copied
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : copyFailed
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-blue-200/90 bg-white text-blue-800 hover:border-blue-300 hover:bg-blue-50"
            }`}
            aria-label="העתקת הקוד ללוח ההדבקה"
          >
            <motion.span
              className="inline-flex"
              animate={
                copied && !reduceMotion ? { scale: [1, 1.15, 1] } : {}
              }
              transition={{ duration: 0.4 }}
            >
              <CopyIcon className="h-4 w-4 shrink-0" />
            </motion.span>
            {copied ? "הועתק ללוח" : copyFailed ? "ההעתקה נכשלה" : "העתק ללוח"}
          </motion.button>
        </div>
        {(row.kind || row.note) && (
          <motion.div
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            {row.kind ? (
              <span className="inline-flex rounded-lg bg-(--accent-soft) px-2.5 py-1 text-xs font-semibold text-blue-900">
                {row.kind}
              </span>
            ) : null}
            {row.note ? (
              <span className="text-sm text-slate-600">{row.note}</span>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.li>
  );
}
