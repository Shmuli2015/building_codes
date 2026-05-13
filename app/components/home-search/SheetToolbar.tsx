"use client";

import { motion, useReducedMotion } from "framer-motion";

import { RefreshIcon } from "./icons";

type Props = {
  loading: boolean;
  onRefresh: () => void;
  lastFetch: string | null;
};

export function SheetToolbar({ loading, onRefresh, lastFetch }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
      <motion.button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/35 transition-colors hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <motion.span
          className="inline-flex"
          animate={loading && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
          transition={
            loading
              ? { duration: 0.85, repeat: Infinity, ease: "linear" }
              : { duration: 0.2 }
          }
        >
          <RefreshIcon className="h-4 w-4" />
        </motion.span>
        {loading ? "טוען..." : "רענן רשימה"}
      </motion.button>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {lastFetch && (
          <motion.span
            className="text-xs font-medium text-slate-500"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            עדכון אחרון:{" "}
            {new Date(lastFetch).toLocaleString("he-IL", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </motion.span>
        )}
      </div>
    </div>
  );
}
