"use client";

import { Loader2 } from "lucide-react";
import type { AuthorizedUser } from "../types";
import { AuthorizedTableDesktop } from "./AuthorizedTableDesktop";
import { AuthorizedTableMobile } from "./AuthorizedTableMobile";
import { AuthorizedEmptyState } from "./AuthorizedEmptyState";

type Props = {
  users: AuthorizedUser[];
  totalCount: number;
  loadingList: boolean;
  currentUserEmail: string | null;
  deleting: boolean;
  onRequestEdit: (user: AuthorizedUser) => void;
  onRequestDelete: (user: AuthorizedUser) => void;
  onClearFilters: () => void;
};

export function AuthorizedTableView({
  users,
  totalCount,
  loadingList,
  currentUserEmail,
  deleting,
  onRequestEdit,
  onRequestDelete,
  onClearFilters,
}: Props) {
  if (loadingList && totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/60 py-16 backdrop-blur-md">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="mt-2 text-sm text-slate-500">טוען רשימת מורשים...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <AuthorizedEmptyState
        isFiltered={totalCount > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AuthorizedTableDesktop
        users={users}
        currentUserEmail={currentUserEmail}
        deleting={deleting}
        onRequestEdit={onRequestEdit}
        onRequestDelete={onRequestDelete}
      />
      <AuthorizedTableMobile
        users={users}
        currentUserEmail={currentUserEmail}
        deleting={deleting}
        onRequestEdit={onRequestEdit}
        onRequestDelete={onRequestDelete}
      />
    </div>
  );
}
