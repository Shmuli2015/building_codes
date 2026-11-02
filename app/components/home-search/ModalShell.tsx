"use client";

import { type ReactNode, type RefObject } from "react";
import { AnimatePresence, m } from "framer-motion";
import { CloseIcon } from "./icons";
import { springSnappy } from "./motion-config";

type Props = {
  open: boolean;
  overlayKey: string;
  titleId: string;
  title: string;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  reduceMotion: boolean | null;
  children: ReactNode;
};

export function ModalShell({
  open,
  overlayKey,
  titleId,
  title,
  onClose,
  closeButtonRef,
  reduceMotion,
  children,
}: Props) {
  const backdropTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion ? { duration: 0.18 } : springSnappy;

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <m.div
          key={overlayKey}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <m.button
            type="button"
            aria-label="סגור"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(92dvh,46rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.875rem] border border-white/70 bg-linear-to-b from-white via-white to-slate-50/[0.96] shadow-[var(--shadow-card)] ring-1 ring-blue-600/[0.07] sm:rounded-[var(--radius-2xl)] sm:shadow-[var(--shadow-card),0_32px_64px_-32px_rgba(15,23,42,0.18)]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 48, scale: 0.92, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.96, filter: "blur(4px)" }
            }
            transition={panelTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100/95 bg-linear-to-l from-blue-50/70 via-white to-indigo-50/40 px-4 py-[1.015rem] sm:px-5">
              <h2
                id={titleId}
                className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
              >
                {title}
              </h2>
              <m.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={
                  reduceMotion ? undefined : { scale: 1.08, rotate: 90 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="rounded-xl p-2.5 text-slate-500 outline-none ring-blue-600/35 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-[3px]"
                aria-label="סגור חלון"
              >
                <CloseIcon className="h-5 w-5" />
              </m.button>
            </div>
            {children}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
