"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { ADDRESS_INPUT_CLASS } from "@/app/components/home-search/constants";

type Props = {
  name: string;
  onNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  submitting: boolean;
  actionError: string | null;
  actionSuccess: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthorizedAddCard({
  name,
  onNameChange,
  email,
  onEmailChange,
  submitting,
  actionError,
  actionSuccess,
  onSubmit,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-[var(--shadow-card)] ring-1 ring-white/60 backdrop-blur-md sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <UserPlus className="h-4 w-4" aria-hidden />
        </div>
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
          הוספת מורשה חדש
        </h2>
      </div>

      {actionError && (
        <div
          className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-800"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          className="mb-3 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-700">
          <span>שם מלא</span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="לדוגמה: ישראל ישראלי"
            className={ADDRESS_INPUT_CLASS}
            required
            disabled={submitting}
          />
        </label>

        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-700">
          <span>כתובת אימייל</span>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="name@example.com"
            className={ADDRESS_INPUT_CLASS}
            dir="ltr"
            required
            disabled={submitting}
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !name.trim() || !email.trim()}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          <span>{submitting ? "מוסיף..." : "הוסף מורשה"}</span>
        </button>
      </form>
    </div>
  );
}

