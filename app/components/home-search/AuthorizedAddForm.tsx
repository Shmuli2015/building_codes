"use client";

import { m } from "framer-motion";
import { ADDRESS_INPUT_CLASS } from "./constants";

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  error: string | null;
  success: boolean;
  submitting: boolean;
  loadingList: boolean;
  reduceMotion: boolean | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
};

export function AuthorizedAddForm({
  name,
  onNameChange,
  email,
  onEmailChange,
  error,
  success,
  submitting,
  loadingList,
  reduceMotion,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
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
            onChange={(e) => onNameChange(e.target.value)}
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
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="email@example.com"
              className={ADDRESS_INPUT_CLASS}
              dir="ltr"
              autoComplete="email"
              required
            />
          </label>
          <m.button
            type="submit"
            disabled={
              submitting || loadingList || !name.trim() || !email.trim()
            }
            whileHover={
              reduceMotion || submitting || loadingList
                ? undefined
                : { scale: 1.01 }
            }
            whileTap={
              reduceMotion || submitting || loadingList
                ? undefined
                : { scale: 0.99 }
            }
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="relative min-h-11 shrink-0 overflow-hidden rounded-xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-8px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
          >
            {submitting ? "מוסיף..." : "הוסף"}
          </m.button>
        </div>
      </div>
    </form>
  );
}
