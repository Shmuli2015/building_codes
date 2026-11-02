"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { BackgroundGlow } from "@/app/components/home-search/BackgroundGlow";
import { DeleteAuthorizedConfirmModal } from "@/app/components/home-search/DeleteAuthorizedConfirmModal";
import type { AuthorizedPageViewProps } from "../types";
import { useAuthorizedPage } from "../hooks/useAuthorizedPage";
import { AuthorizedHeader } from "./AuthorizedHeader";
import { AuthorizedGate } from "./AuthorizedGate";
import { AuthorizedAddCard } from "./AuthorizedAddCard";
import { AuthorizedFilterBar } from "./AuthorizedFilterBar";
import { AuthorizedTableView } from "./AuthorizedTableView";
import { EditAuthorizedModal } from "./EditAuthorizedModal";

export function AuthorizedPageView({
  currentUserEmail,
  addAuthorizedEnabled,
}: AuthorizedPageViewProps) {
  const {
    passwordVerified,
    enteredPassword,
    setEnteredPassword,
    showPassword,
    toggleShowPassword,
    verifyingPassword,
    passwordError,
    handleGateSubmit,
    filteredUsers,
    totalCount,
    filteredCount,
    loadingList,
    listError,
    searchQuery,
    setSearchQuery,
    name,
    setName,
    email,
    setEmail,
    submitting,
    actionError,
    actionSuccess,
    handleCreateUser,
    userToDelete,
    setUserToDelete,
    deleting,
    handleConfirmDelete,
    userToEdit,
    setUserToEdit,
    editing,
    editError,
    handleConfirmEdit,
    loadUsers,
    handleLock,
  } = useAuthorizedPage({
    currentUserEmail,
    addAuthorizedEnabled,
  });

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative flex w-full flex-1 flex-col overflow-x-clip">
        <BackgroundGlow />

        {!passwordVerified ? (
          <AuthorizedGate
            enteredPassword={enteredPassword}
            onPasswordChange={setEnteredPassword}
            showPassword={showPassword}
            onToggleShowPassword={toggleShowPassword}
            verifyingPassword={verifyingPassword}
            passwordError={passwordError}
            onSubmit={handleGateSubmit}
          />
        ) : (
          <div className="relative z-1 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
            <AuthorizedHeader
              totalCount={totalCount}
              filteredCount={filteredCount}
              onRefresh={() => void loadUsers()}
              isRefreshing={loadingList}
              onLock={handleLock}
            />

            {listError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-800"
                role="alert"
              >
                {listError}
              </div>
            )}

            {addAuthorizedEnabled && (
              <AuthorizedAddCard
                name={name}
                onNameChange={setName}
                email={email}
                onEmailChange={setEmail}
                submitting={submitting}
                actionError={actionError}
                actionSuccess={actionSuccess}
                onSubmit={(e) => void handleCreateUser(e)}
              />
            )}

            <div className="flex flex-col gap-3">
              <AuthorizedFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />

              <AuthorizedTableView
                users={filteredUsers}
                totalCount={totalCount}
                loadingList={loadingList}
                currentUserEmail={currentUserEmail}
                deleting={deleting}
                onRequestEdit={(user) => setUserToEdit(user)}
                onRequestDelete={(user) => setUserToDelete(user)}
                onClearFilters={() => setSearchQuery("")}
              />
            </div>
          </div>
        )}

        <EditAuthorizedModal
          user={userToEdit}
          submitting={editing}
          error={editError}
          onClose={() => setUserToEdit(null)}
          onSave={handleConfirmEdit}
        />

        <DeleteAuthorizedConfirmModal
          open={Boolean(userToDelete)}
          email={userToDelete?.email ?? null}
          name={userToDelete?.name}
          deleting={deleting}
          onClose={() => setUserToDelete(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </LazyMotion>
  );
}
