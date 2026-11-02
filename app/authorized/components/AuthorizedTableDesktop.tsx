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

export function AuthorizedTableDesktop({
  users,
  currentUserEmail,
  deleting,
  onRequestEdit,
  onRequestDelete,
}: Props) {
  const normalizedCurrent = currentUserEmail?.trim().toLowerCase() ?? null;

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[var(--shadow-card)] ring-1 ring-white/60 backdrop-blur-md md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-slate-200/70 bg-slate-50/80 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">שם</th>
              <th className="px-4 py-3.5 whitespace-nowrap">כתובת אימייל</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">סטטוס</th>
              <th className="px-4 py-3.5 text-center whitespace-nowrap">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isCurrentUser =
                normalizedCurrent !== null &&
                user.email.toLowerCase() === normalizedCurrent;

              return (
                <tr
                  key={user.email}
                  className="transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {user.name || "-"}
                  </td>

                  <td
                    className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap"
                    dir="ltr"
                  >
                    {user.email}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {isCurrentUser ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200/60">
                        את/ה
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        מורשה
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onRequestEdit(user)}
                        aria-label={`ערוך את ${user.name || user.email}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => onRequestDelete(user)}
                          disabled={deleting}
                          aria-label={`מחק את ${user.name || user.email}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
