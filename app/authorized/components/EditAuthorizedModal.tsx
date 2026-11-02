"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { AuthorizedUser } from "../types";
import { EditAuthorizedForm } from "./EditAuthorizedForm";

type Props = {
  user: AuthorizedUser | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (newName: string, newEmail: string) => Promise<void>;
};

export function EditAuthorizedModal({
  user,
  submitting,
  error,
  onClose,
  onSave,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.button
            type="button"
            aria-label="סגור"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            disabled={submitting}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm disabled:cursor-not-allowed"
          />

          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-authorized-modal-title"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 10 }
            }
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <EditAuthorizedForm
              key={user.email}
              user={user}
              submitting={submitting}
              error={error}
              onClose={onClose}
              onSave={onSave}
            />
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
