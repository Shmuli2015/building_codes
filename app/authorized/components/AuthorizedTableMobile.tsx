"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AuthorizedUser } from "../types";

type Props = {
  users: AuthorizedUser[];
  currentUserEmail: string | null;
  deleting: boolean;
  onRequestEdit: (user: AuthorizedUser) => void;
  onRequestDelete: (user: AuthorizedUser) => void;
};

export function AuthorizedTableMobile({
  users,
  currentUserEmail,
  deleting,
  onRequestEdit,
  onRequestDelete,
}: Props) {
  const normalizedCurrent = currentUserEmail?.trim().toLowerCase() ?? null;

  return (
    <div className="flex flex-col gap-2 md:hidden">
      {users.map((user) => {
        const isCurrentUser =
          normalizedCurrent !== null &&
          user.email.toLowerCase() === normalizedCurrent;

        return (
          <div
            key={user.email}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur-md"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {user.name || "-"}
                </span>
                {isCurrentUser && (
                  <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200/60">
                    את/ה
                  </span>
                )}
              </div>
              <span
                className="truncate font-mono text-xs text-slate-500"
                dir="ltr"
              >
                {user.email}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onRequestEdit(user)}
                aria-label={`ערוך את ${user.name || user.email}`}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-xs transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>

              {!isCurrentUser && (
                <button
                  type="button"
                  onClick={() => onRequestDelete(user)}
                  disabled={deleting}
                  aria-label={`מחק את ${user.name || user.email}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-xs transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
