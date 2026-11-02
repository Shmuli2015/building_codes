"use client";

import { m } from "framer-motion";
import { ADDRESS_INPUT_CLASS } from "./constants";

type Props = {
  label: string;
  enteredPassword: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  passwordError: string | null;
  verifyingPassword: boolean;
  reduceMotion: boolean | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
};

export function PasswordGateSection({
  label,
  enteredPassword,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  passwordError,
  verifyingPassword,
  reduceMotion,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
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
          <span className="font-semibold text-slate-800">{label}</span>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              inputMode="numeric"
              value={enteredPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="הזן קוד אבטחה..."
              className={`${ADDRESS_INPUT_CLASS} pl-10`}
              autoComplete="off"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
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
          whileHover={
            reduceMotion || verifyingPassword ? undefined : { scale: 1.01 }
          }
          whileTap={
            reduceMotion || verifyingPassword ? undefined : { scale: 0.99 }
          }
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifyingPassword ? "מאמת..." : "המשך"}
        </m.button>
      </div>
    </form>
  );
}
