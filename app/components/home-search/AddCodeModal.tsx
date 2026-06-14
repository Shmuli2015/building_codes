"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { CloseIcon } from "./icons";
import { AutocompleteInput } from "./AutocompleteInput";
import { capDatalistOptions } from "@/lib/search-index";
import { addBuildingCode } from "@/lib/sheet-actions";
import { ADDRESS_INPUT_CLASS } from "./constants";
import { springSnappy } from "./motion-config";

type Props = {
  open: boolean;
  onClose: () => void;
  addCodePassword?: string;
  availableStreets?: string[];
  availableAreas?: string[];
  onSuccess: () => void;
  initialPasswordVerified?: boolean;
};

export function AddCodeModal({
  open,
  onClose,
  addCodePassword,
  availableStreets = [],
  availableAreas = [],
  onSuccess,
  initialPasswordVerified = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [code, setCode] = useState("");
  const [selectedKind, setSelectedKind] = useState("בניין");
  const [customKind, setCustomKind] = useState("");
  const [note, setNote] = useState("");

  const [passwordVerified, setPasswordVerified] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Filter autocomplete options based on current value
  const streetOptions = useMemo(
    () => capDatalistOptions(availableStreets, street),
    [availableStreets, street],
  );

  const areaOptions = useMemo(
    () => capDatalistOptions(availableAreas, area),
    [availableAreas, area],
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setArea("");
      setStreet("");
      setHouseNumber("");
      setCode("");
      setSelectedKind("בניין");
      setCustomKind("");
      setNote("");
      setError(null);
      setSuccess(false);
      setPasswordVerified(initialPasswordVerified);
      setEnteredPassword("");
      setShowPassword(false);
      setPasswordError(null);
      closeButtonRef.current?.focus();
    }
  }, [open, initialPasswordVerified]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === addCodePassword) {
      setPasswordVerified(true);
      setPasswordError(null);
    } else {
      setPasswordError("קוד אבטחה שגוי. נא לנסות שוב.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCodePassword) return;

    if (!street.trim() || !houseNumber.trim() || !code.trim()) {
      setError("נא למלא את כל שדות החובה (רחוב, מספר בית וקוד).");
      return;
    }

    setSubmitting(true);
    setError(null);

    const finalKind = selectedKind === "אחר" ? (customKind.trim() || "אחר") : selectedKind;

    try {
      const result = await addBuildingCode(addCodePassword, {
        area: area.trim(),
        street: street.trim(),
        number: houseNumber.trim(),
        code: code.trim(),
        kind: finalKind.trim(),
        note: note.trim(),
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error ?? "אירעה שגיאה בשמירת הקוד.");
      }
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const backdropTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };

  const panelTransition = reduceMotion
    ? { duration: 0.18 }
    : springSnappy;

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <m.div
          key="add-code-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-5"
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
            aria-labelledby="add-code-modal-title"
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
                id="add-code-modal-title"
                className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
              >
                {!passwordVerified ? "אימות קוד אבטחה" : "הוספת קוד כניסה חדש"}
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
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 text-center font-medium" role="alert">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-800">הזן קוד אבטחה להוספה</span>
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "הסתר קוד" : "הצג קוד"}
                      >
                        {showPassword ? (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                            <line x1="2" x2="22" y1="2" y2="22"/>
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <m.button
                    type="submit"
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    className="relative min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97]"
                  >
                    המשך
                  </m.button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
              >
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 text-center font-medium" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 text-center font-medium" role="alert">
                    הקוד נשמר בהצלחה! מרענן נתונים...
                  </div>
                )}

                <div className="space-y-4">
                  <AutocompleteInput
                    label="רחוב *"
                    value={street}
                    onChange={setStreet}
                    options={streetOptions}
                    placeholder="למשל: העלייה, ינאי..."
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-semibold text-slate-800">מספר בית *</span>
                      <input
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="למשל: 3"
                        className={ADDRESS_INPUT_CLASS}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-semibold text-slate-800">קוד *</span>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="למשל: 1234"
                        className={ADDRESS_INPUT_CLASS}
                        required
                      />
                    </label>
                  </div>

                  <AutocompleteInput
                    label="אזור / שכונה (אופציונלי)"
                    value={area}
                    onChange={setArea}
                    options={areaOptions}
                    placeholder="למשל: רמת בית שמש א'"
                  />

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-800">סוג קוד</span>
                    <select
                      value={selectedKind}
                      onChange={(e) => {
                        setSelectedKind(e.target.value);
                        if (e.target.value !== "אחר") {
                          setCustomKind("");
                        }
                      }}
                      className={`${ADDRESS_INPUT_CLASS} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_auto] bg-[position:left_1rem_center] bg-no-repeat`}
                    >
                      <option value="בניין">בניין</option>
                      <option value="מעלית">מעלית</option>
                      <option value="אחר">אחר...</option>
                    </select>
                  </label>

                  {selectedKind === "אחר" && (
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-semibold text-slate-800">הזן סוג קוד מותאם אישית *</span>
                      <input
                        type="text"
                        value={customKind}
                        onChange={(e) => setCustomKind(e.target.value)}
                        placeholder="למשל: אינטרקום, שער, מחסן..."
                        className={ADDRESS_INPUT_CLASS}
                        required
                      />
                    </label>
                  )}

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-800">הערה (אופציונלי)</span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="הערות לגבי הקוד או דרך ההפעלה..."
                      className={`${ADDRESS_INPUT_CLASS} min-h-20 py-2 resize-none`}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <m.button
                    type="submit"
                    disabled={submitting || success}
                    whileHover={reduceMotion || submitting || success ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion || submitting || success ? undefined : { scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    className="relative min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.3]"
                  >
                    {submitting ? "שומר קוד כניסה..." : "שמור קוד כניסה"}
                  </m.button>
                </div>
              </form>
            )}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
