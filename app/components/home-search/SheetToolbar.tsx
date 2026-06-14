"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { formatRelativeTimeHe } from "@/lib/relative-time-he";
import { logout } from "@/lib/auth-actions";

import { LogOutIcon, RefreshIcon } from "./icons";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

type Props = {
  loading: boolean;
  onRefresh: () => void;
  lastFetch: string | null;
  onAddCodeClick?: () => void;
  onAddAuthorizedClick?: () => void;
};

export function SheetToolbar({
  loading,
  onRefresh,
  lastFetch,
  onAddCodeClick,
  onAddAuthorizedClick,
}: Props) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const [relativeTick, setRelativeTick] = useState(0);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLogoutConfirmOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setRelativeTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const relativeLabel = useMemo(
    () => (lastFetch && mounted ? formatRelativeTimeHe(lastFetch) : ""),
    [lastFetch, relativeTick, mounted],
  );

  const absoluteTitle = useMemo(() => {
    if (!lastFetch || !mounted) return undefined;
    try {
      return new Date(lastFetch).toLocaleString("he-IL", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return undefined;
    }
  }, [lastFetch, mounted]);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-2.5 py-2 shadow-[var(--shadow-card)] ring-1 ring-white/50 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-1.5">
      <div className="flex items-center justify-between gap-2 sm:min-w-0 sm:flex-1 sm:justify-start">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <m.button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            aria-label={loading ? "טוען" : "רענון"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/70 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5"
          >
            <m.span
              className="inline-flex text-blue-600"
              animate={loading && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
              transition={
                loading
                  ? { duration: 0.85, repeat: Infinity, ease: "linear" }
                  : { duration: 0.2 }
              }
            >
              <RefreshIcon className="h-3.5 w-3.5 shrink-0" />
            </m.span>
            <span className="hidden sm:inline">{loading ? "טוען…" : "רענון"}</span>
          </m.button>

          {onAddCodeClick && (
            <m.button
              type="button"
              onClick={onAddCodeClick}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              aria-label="הוספת קוד"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-100 bg-blue-50/50 px-2 py-1.5 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm transition-colors hover:border-blue-200 hover:bg-blue-50 sm:gap-1.5 sm:px-2.5"
            >
              <KeyRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="sm:hidden">קוד</span>
              <span className="hidden sm:inline">הוספת קוד</span>
            </m.button>
          )}

          {onAddAuthorizedClick && (
            <m.button
              type="button"
              onClick={onAddAuthorizedClick}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              aria-label="הוספת מורשה"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 sm:gap-1.5 sm:px-2.5"
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="sm:hidden">מורשה</span>
              <span className="hidden sm:inline">הוספת מורשה</span>
            </m.button>
          )}
        </div>

        <m.button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-slate-700 sm:hidden"
          aria-label="יציאה"
        >
          <LogOutIcon className="h-3.5 w-3.5 shrink-0" />
        </m.button>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2 sm:contents">
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 text-xs text-slate-600 sm:max-w-none sm:flex-none"
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${lastFetch ? "bg-emerald-500" : "bg-slate-300"}`}
            aria-hidden
          />
          {lastFetch && mounted ? (
            <m.time
              dateTime={lastFetch}
              title={absoluteTitle}
              className="truncate"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              עודכן {relativeLabel}
            </m.time>
          ) : (
            <span className="truncate">
              {lastFetch ? "טוען..." : "ממתין לעדכון"}
            </span>
          )}
        </div>

        <m.button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-slate-700 sm:inline-flex"
          aria-label="יציאה"
        >
          <LogOutIcon className="h-3.5 w-3.5 shrink-0" />
          <span>יציאה</span>
        </m.button>
      </div>

      <LogoutConfirmModal
        open={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          void logout();
        }}
      />
    </div>
  );
}
