"use client";

import type { BuildingCodeRow } from "@/lib/building-codes";
import { m, useReducedMotion } from "framer-motion";
import { springSnappy } from "./motion-config";
import { CopyIcon } from "./icons";
import { getCodeRoleInfo } from "./helpers/codeRole";

type Props = {
  row: BuildingCodeRow;
  index: number;
  totalMatches?: number;
  hideAddress?: boolean;
  copied: boolean;
  copyFailed: boolean;
  onCopy: () => void;
};

export function ResultMatchCard({
  row,
  index,
  totalMatches = 1,
  hideAddress = false,
  copied,
  copyFailed,
  onCopy,
}: Props) {
  const reduceMotion = useReducedMotion();
  const roleInfo = getCodeRoleInfo(index, totalMatches);
  const isAlt = roleInfo?.isAlternative ?? false;

  const sideBarGradient = isAlt
    ? "bg-linear-to-b from-amber-400 to-amber-600"
    : "bg-linear-to-b from-blue-500 to-indigo-600";

  return (
    <m.li
      layout
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        ...springSnappy,
        delay: reduceMotion ? 0 : index * 0.07,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-lg shadow-slate-900/5 ring-1 ring-white/80 ${
        isAlt
          ? "border-amber-200/80 bg-linear-to-br from-white/95 to-amber-50/30"
          : "border-slate-200/70 bg-linear-to-br from-white/95 to-slate-50/90"
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 w-1 opacity-95 ${sideBarGradient}`}
      />
      <div className="pr-3">
        {roleInfo ? (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-bold ${
                isAlt
                  ? "border-amber-300/80 bg-amber-50 text-amber-900"
                  : "border-blue-300/80 bg-blue-50 text-blue-900"
              }`}
            >
              {roleInfo.badgeLabel}
            </span>
            {row.kind ? (
              <span className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                {row.kind}
              </span>
            ) : null}
          </div>
        ) : !hideAddress ? (
          <p className="text-sm font-medium text-slate-600">
            {row.area ? `${row.area} · ` : ""}
            {row.street} {row.number}
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
          <m.p
            className="min-w-0 break-all font-mono text-3xl font-bold tracking-[0.15em] text-slate-900 sm:text-4xl"
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              ...springSnappy,
              delay: reduceMotion ? 0 : 0.05 + index * 0.07,
            }}
          >
            {row.code}
          </m.p>
          <m.button
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
                  : isAlt
                    ? "border-amber-300/90 bg-white text-amber-900 hover:border-amber-400 hover:bg-amber-50"
                    : "border-blue-200/90 bg-white text-blue-800 hover:border-blue-300 hover:bg-blue-50"
            }`}
            aria-label="העתקת הקוד ללוח ההדבקה"
          >
            <m.span
              className="inline-flex"
              animate={
                copied && !reduceMotion ? { scale: [1, 1.15, 1] } : {}
              }
              transition={{ duration: 0.4 }}
            >
              <CopyIcon className="h-4 w-4 shrink-0" />
            </m.span>
            {copied ? "הועתק ללוח" : copyFailed ? "ההעתקה נכשלה" : "העתק ללוח"}
          </m.button>
        </div>

        {!roleInfo && row.kind ? (
          <m.div
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <span className="inline-flex rounded-xl border border-blue-500/25 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-blue-900">
              {row.kind}
            </span>
          </m.div>
        ) : null}

        {row.note ? (
          <p className="mt-2 text-xs text-slate-500 break-words">
            {row.note}
          </p>
        ) : null}
      </div>
    </m.li>
  );
}
