"use client";

import type { AuthorizedUser } from "@/lib/auth-types";

type Props = {
  users: AuthorizedUser[];
  loadingList: boolean;
  deletingEmail: string | null;
  currentUserEmail?: string | null;
  onRefresh: () => void;
  onRequestDelete: (email: string) => void;
};

export function AuthorizedUsersList({
  users,
  loadingList,
  deletingEmail,
  currentUserEmail,
  onRefresh,
  onRequestDelete,
}: Props) {
  const normalizedCurrentEmail =
    currentUserEmail?.trim().toLowerCase() ?? null;

  const isCurrentUser = (email: string) =>
    normalizedCurrentEmail !== null && email === normalizedCurrentEmail;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">
          מורשים ({users.length})
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loadingList}
          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800 disabled:opacity-50"
        >
          {loadingList ? "טוען..." : "רענון"}
        </button>
      </div>

      {loadingList && users.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">טוען רשימה...</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          אין מורשים ברשימה.
        </p>
      ) : (
        <ul className="space-y-1.5" dir="rtl" aria-label="רשימת מורשים">
          {users.map((user) => (
            <li
              key={user.email}
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-800"
            >
              <span className="min-w-0 flex-1 text-right">
                <span className="block truncate font-medium text-slate-900">
                  {user.name || "-"}
                </span>
                <span
                  className="mt-0.5 block truncate text-xs text-slate-500"
                  dir="ltr"
                >
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
                  onClick={() => onRequestDelete(user.email)}
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
  );
}
