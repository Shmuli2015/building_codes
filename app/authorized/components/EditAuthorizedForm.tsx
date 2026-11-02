"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { ADDRESS_INPUT_CLASS } from "@/app/components/home-search/constants";
import type { AuthorizedUser } from "../types";

type Props = {
  user: AuthorizedUser;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (newName: string, newEmail: string) => Promise<void>;
};

export function EditAuthorizedForm({
  user,
  submitting,
  error,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await onSave(name.trim(), email.trim());
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Edit3 className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3
            id="edit-authorized-modal-title"
            className="text-base font-bold text-slate-900 sm:text-lg"
          >
            עריכת מורשה
          </h3>
          <p className="text-xs text-slate-500">
            עדכון פרטי המורשה בגיליון המערכת
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
          <span>שם מלא</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ישראל ישראלי"
            className={ADDRESS_INPUT_CLASS}
            required
            disabled={submitting}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
          <span>כתובת אימייל</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={ADDRESS_INPUT_CLASS}
            dir="ltr"
            required
            disabled={submitting}
          />
        </label>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            ביטול
          </button>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !email.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {submitting ? "שומר..." : "שמור שינויים"}
          </button>
        </div>
      </form>
    </>
  );
}

