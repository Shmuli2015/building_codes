"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { CloseIcon } from "./icons";
import {
  addAuthorizedEmail,
  listAuthorizedEmails,
  removeAuthorizedEmail,
  verifyAddAuthorizedPassword,
} from "@/lib/sheet-actions";
import type { AuthorizedUser } from "@/lib/auth-types";
import { ADDRESS_INPUT_CLASS } from "./constants";
import { springSnappy } from "./motion-config";
import { DeleteAuthorizedConfirmModal } from "./DeleteAuthorizedConfirmModal";

type Props = {
  open: boolean;
  onClose: () => void;
  addAuthorizedEnabled?: boolean;
  currentUserEmail?: string | null;
  onSuccess: () => void;
};

export function AddAuthorizedModal({
  open,
  onClose,
  addAuthorizedEnabled,
  currentUserEmail,
  onSuccess,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);

  const [passwordVerified, setPasswordVerified] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const loadList = useCallback(async (password: string) => {
    setLoadingList(true);
    setError(null);
    try {
      const result = await listAuthorizedEmails(password);
      if (result.success && result.users) {
        setAuthorizedUsers(result.users);
      } else {
        setError(result.error ?? "שגיאה בטעינת רשימת המורשים.");
      }
    } catch {
      setError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setEmail("");
      setName("");
      setAuthorizedUsers([]);
      setError(null);
      setSuccess(false);
      setPasswordVerified(false);
      setEnteredPassword("");
      setShowPassword(false);
      setPasswordError(null);
      setVerifyingPassword(false);
      setLoadingList(false);
      setDeletingEmail(null);
      setEmailToDelete(null);
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const handlePasswordSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyingPassword(true);
    setPasswordError(null);

    try {
      const result = await verifyAddAuthorizedPassword(enteredPassword);
      if (result.verified) {
        setPasswordVerified(true);
        setPasswordError(null);
        await loadList(enteredPassword);
      } else {
        setPasswordError(result.error ?? "קוד אבטחה שגוי. נא לנסות שוב.");
      }
    } catch {
      setPasswordError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addAuthorizedEnabled) return;

    if (!email.trim()) {
      setError("נא להזין כתובת אימייל.");
      return;
    }

    if (!name.trim()) {
      setError("נא להזין שם.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await addAuthorizedEmail(enteredPassword, email.trim(), name.trim());

      if (result.success) {
        setSuccess(true);
        setEmail("");
        setName("");
        onSuccess();
        await loadList(enteredPassword);
      } else {
        setError(result.error ?? "אירעה שגיאה בהוספת המורשה.");
      }
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!addAuthorizedEnabled || !emailToDelete) return;

    setDeletingEmail(emailToDelete);
    setError(null);
    setSuccess(false);

    try {
      const result = await removeAuthorizedEmail(enteredPassword, emailToDelete);
      if (result.success) {
        setEmailToDelete(null);
        onSuccess();
        await loadList(enteredPassword);
      } else {
        setError(result.error ?? "אירעה שגיאה במחיקת המורשה.");
      }
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setDeletingEmail(null);
    }
  };

  const backdropTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion ? { duration: 0.18 } : springSnappy;

  const modalTitle = !passwordVerified
    ? "אימות קוד אבטחה"
    : "רשימת מורשים";

  const userToDelete = emailToDelete
    ? authorizedUsers.find((user) => user.email === emailToDelete)
    : null;

  const normalizedCurrentEmail = currentUserEmail?.trim().toLowerCase() ?? null;

  const isCurrentUser = (email: string) =>
    normalizedCurrentEmail !== null && email === normalizedCurrentEmail;

  return (
    <>
    <AnimatePresence mode="wait">
      {open ? (
        <m.div
          key="add-authorized-overlay"
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
            aria-labelledby="add-authorized-modal-title"
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
                id="add-authorized-modal-title"
                className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
              >
                {modalTitle}
              </h2>
              <m.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 90 }}
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="rounded-xl p-2.5 text-slate-500 outline-none ring-blue-600/35 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-[3px]"
                aria-label="סגור חלון"
              >
                <CloseIcon className="h-5 w-5" />
              </m.button>
            </div>

            {!passwordVerified ? (
              <form
                onSubmit={handlePasswordSubmit}
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
              >
                {passwordError && (
                  <div
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-800"
                    role="alert"
                  >
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-800">הזן קוד אבטחה לצפייה ברשימת המורשים</span>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        inputMode="numeric"
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        placeholder="הזן קוד אבטחה..."
                        className={`${ADDRESS_INPUT_CLASS} pl-10`}
                        autoComplete="off"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                        tabIndex={-1}
                        aria-label={showPassword ? "הסתר קוד" : "הצג קוד"}
                      >
                        {showPassword ? (
                          <svg
                            className="h-4.5 w-4.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            className="h-4.5 w-4.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <m.button
                    type="submit"
                    disabled={verifyingPassword}
                    whileHover={reduceMotion || verifyingPassword ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion || verifyingPassword ? undefined : { scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    className="relative min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyingPassword ? "מאמת..." : "המשך"}
                  </m.button>
                </div>
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <form
                  onSubmit={handleSubmit}
                  className="shrink-0 border-b border-slate-100/95 px-4 py-4 sm:px-6"
                >
                  {error && (
                    <div
                      className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-800"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-800"
                      role="alert"
                    >
                      המורשה נוסף בהצלחה!
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-semibold text-slate-800">שם *</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="למשל: יוסי כהן"
                        className={ADDRESS_INPUT_CLASS}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
                        <span className="font-semibold text-slate-800">אימייל *</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className={ADDRESS_INPUT_CLASS}
                          dir="ltr"
                          autoComplete="email"
                          required
                        />
                      </label>
                      <m.button
                        type="submit"
                        disabled={submitting || loadingList || !name.trim() || !email.trim()}
                        whileHover={reduceMotion || submitting || loadingList ? undefined : { scale: 1.01 }}
                        whileTap={reduceMotion || submitting || loadingList ? undefined : { scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                        className="relative min-h-11 shrink-0 overflow-hidden rounded-xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-8px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
                      >
                        {submitting ? "מוסיף..." : "הוסף"}
                      </m.button>
                    </div>
                  </div>
                </form>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      מורשים ({authorizedUsers.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadList(enteredPassword)}
                      disabled={loadingList}
                      className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800 disabled:opacity-50"
                    >
                      {loadingList ? "טוען..." : "רענון"}
                    </button>
                  </div>

                  {loadingList && authorizedUsers.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">טוען רשימה...</p>
                  ) : authorizedUsers.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">אין מורשים ברשימה.</p>
                  ) : (
                    <ul className="space-y-1.5" dir="rtl" aria-label="רשימת מורשים">
                      {authorizedUsers.map((user) => (
                        <li
                          key={user.email}
                          className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-800"
                        >
                          <span className="min-w-0 flex-1 text-right">
                            <span className="block truncate font-medium text-slate-900">
                              {user.name || "—"}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500" dir="ltr">
                              {user.email}
                            </span>
                          </span>
                          {isCurrentUser(user.email) ? (
                            <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              את/ה
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEmailToDelete(user.email)}
                              disabled={deletingEmail !== null || loadingList}
                              aria-label={`מחק ${user.name || user.email}`}
                              className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingEmail === user.email ? (
                                <span className="text-xs font-medium">…</span>
                              ) : (
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  <line x1="10" x2="10" y1="11" y2="17" />
                                  <line x1="14" x2="14" y1="11" y2="17" />
                                </svg>
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
    <DeleteAuthorizedConfirmModal
      open={emailToDelete !== null}
      email={emailToDelete}
      name={userToDelete?.name}
      deleting={deletingEmail !== null}
      onClose={() => {
        if (deletingEmail === null) setEmailToDelete(null);
      }}
      onConfirm={() => void handleDeleteConfirm()}
    />
    </>
  );
}
