"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { formatRelativeTimeHe } from "@/lib/relative-time-he";

import { RefreshIcon } from "./icons";
import { logout } from "@/lib/auth-actions";
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
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-0">
      <motion.button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
          <RefreshIcon className="h-3 w-3 shrink-0" />
        </motion.span>
        {loading ? "טוען…" : "רענון"}
      </motion.button>

      <div className="flex items-center gap-3">
        <div className="min-w-0 text-[11px] text-slate-500">
          {lastFetch ? (
            <motion.time
              dateTime={lastFetch}
              title={absoluteTitle}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              עודכן {relativeLabel}
            </motion.time>
          ) : (
            <span>ממתין לעדכון</span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200/50 bg-red-50/50 px-2 py-1 text-[11px] font-medium text-red-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-100/70"
        >
          יציאה
        </motion.button>
      </div>

      <LogoutConfirmModal
        open={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => logout()}
      />
    </div>
  );
}
