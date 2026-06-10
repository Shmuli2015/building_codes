"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { formatRelativeTimeHe } from "@/lib/relative-time-he";
import { logout } from "@/lib/auth-actions";

import { LogOutIcon, RefreshIcon } from "./icons";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

type Props = {
  loading: boolean;
  onRefresh: () => void;
  lastFetch: string | null;
};

export function SheetToolbar({ loading, onRefresh, lastFetch }: Props) {
  const reduceMotion = useReducedMotion();
  const [relativeTick, setRelativeTick] = useState(0);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setRelativeTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const relativeLabel = useMemo(
    () => (lastFetch ? formatRelativeTimeHe(lastFetch) : ""),
    [lastFetch, relativeTick],
  );

  const absoluteTitle = lastFetch
    ? new Date(lastFetch).toLocaleString("he-IL", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : undefined;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-2.5 py-1.5 shadow-[var(--shadow-card)] ring-1 ring-white/50 backdrop-blur-md sm:gap-3 sm:px-3">
      <div className="flex min-w-0 items-center gap-2">
        <motion.button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/70 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <motion.span
            className="inline-flex text-blue-600"
            animate={loading && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={
              loading
                ? { duration: 0.85, repeat: Infinity, ease: "linear" }
                : { duration: 0.2 }
            }
          >
            <RefreshIcon className="h-3.5 w-3.5 shrink-0" />
          </motion.span>
          {loading ? "טוען…" : "רענון"}
        </motion.button>

        <div
          className="flex min-w-0 items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 text-xs text-slate-600"
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${lastFetch ? "bg-emerald-500" : "bg-slate-300"}`}
            aria-hidden
          />
          {lastFetch ? (
            <motion.time
              dateTime={lastFetch}
              title={absoluteTitle}
              className="truncate"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              עודכן {relativeLabel}
            </motion.time>
          ) : (
            <span className="truncate">ממתין לעדכון</span>
          )}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => setIsLogoutConfirmOpen(true)}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-slate-700"
        aria-label="יציאה"
      >
        <LogOutIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">יציאה</span>
      </motion.button>

      <LogoutConfirmModal
        open={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => logout()}
      />
    </div>
  );
}
