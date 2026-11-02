"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { ADDRESS_INPUT_CLASS } from "@/app/components/home-search/constants";

type Props = {
  enteredPassword: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  verifyingPassword: boolean;
  passwordError: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthorizedGate({
  enteredPassword,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  verifyingPassword,
  passwordError,
  onSubmit,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[var(--shadow-card)] ring-1 ring-white/60 backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            כניסה לטאב מורשים
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            יש להזין את קוד האבטחה של הוספת מורשים כדי לגשת לטאב זה
          </p>
        </div>

        {passwordError && (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-800 sm:text-sm"
            role="alert"
          >
            {passwordError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
            <span>קוד אבטחה</span>
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
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={verifyingPassword || !enteredPassword.trim()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-l from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" aria-hidden />
            <span>{verifyingPassword ? "מאמת..." : "כניסה"}</span>
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center border-t border-slate-100 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>חזרה לעמוד הראשי</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

