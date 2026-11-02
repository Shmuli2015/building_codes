"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { verifyAddAuthorizedPassword } from "@/lib/sheet-actions";
import { AuthorizedAddForm } from "./AuthorizedAddForm";
import { AuthorizedUsersList } from "./AuthorizedUsersList";
import { DeleteAuthorizedConfirmModal } from "./DeleteAuthorizedConfirmModal";
import { ModalShell } from "./ModalShell";
import { PasswordGateSection } from "./PasswordGateSection";
import { useAuthorizedUsersAdmin } from "./hooks/useAuthorizedUsersAdmin";
import { useGatePassword } from "./hooks/useGatePassword";

type Props = {
  open: boolean;
  onClose: () => void;
  addAuthorizedEnabled?: boolean;
  currentUserEmail?: string | null;
  onSuccess: () => void;
};

export function AddAuthorizedModal({
  open,
  onClose,
  addAuthorizedEnabled,
  currentUserEmail,
  onSuccess,
}: Props) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const admin = useAuthorizedUsersAdmin({
    open,
    addAuthorizedEnabled,
    onSuccess,
  });

  const gate = useGatePassword({
    open,
    verify: verifyAddAuthorizedPassword,
    onVerified: (password) => admin.loadList(password),
  });

  return (
    <>
      <ModalShell
        open={open}
        overlayKey="add-authorized-overlay"
        titleId="add-authorized-modal-title"
        title={
          !gate.passwordVerified ? "אימות קוד אבטחה" : "רשימת מורשים"
        }
        onClose={onClose}
        closeButtonRef={closeButtonRef}
        reduceMotion={reduceMotion}
      >
        {!gate.passwordVerified ? (
          <PasswordGateSection
            label="הזן קוד אבטחה לצפייה ברשימת המורשים"
            enteredPassword={gate.enteredPassword}
            onPasswordChange={gate.setEnteredPassword}
            showPassword={gate.showPassword}
            onToggleShowPassword={gate.toggleShowPassword}
            passwordError={gate.passwordError}
            verifyingPassword={gate.verifyingPassword}
            reduceMotion={reduceMotion}
            onSubmit={gate.handlePasswordSubmit}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <AuthorizedAddForm
              name={admin.name}
              onNameChange={admin.setName}
              email={admin.email}
              onEmailChange={admin.setEmail}
              error={admin.error}
              success={admin.success}
              submitting={admin.submitting}
              loadingList={admin.loadingList}
              reduceMotion={reduceMotion}
              onSubmit={(e) =>
                void admin.handleSubmit(e, gate.enteredPassword)
              }
            />
            <AuthorizedUsersList
              users={admin.authorizedUsers}
              loadingList={admin.loadingList}
              deletingEmail={admin.deletingEmail}
              currentUserEmail={currentUserEmail}
              onRefresh={() => void admin.loadList(gate.enteredPassword)}
              onRequestDelete={admin.setEmailToDelete}
            />
          </div>
        )}
      </ModalShell>
      <DeleteAuthorizedConfirmModal
        open={admin.emailToDelete !== null}
        email={admin.emailToDelete}
        name={admin.userToDelete?.name}
        deleting={admin.deletingEmail !== null}
        onClose={() => {
          if (admin.deletingEmail === null) {
            admin.setEmailToDelete(null);
          }
        }}
        onConfirm={() => void admin.handleDeleteConfirm(gate.enteredPassword)}
      />
    </>
  );
}
