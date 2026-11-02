"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { verifyAddCodePassword, type CodeWithIndex } from "@/lib/sheet-actions";
import { ModalShell } from "@/app/components/home-search/ModalShell";
import { PasswordGateSection } from "@/app/components/home-search/PasswordGateSection";
import { useGatePassword } from "@/app/components/home-search/hooks/useGatePassword";
import { EditCodeForm } from "./EditCodeForm";

type Props = {
  row: CodeWithIndex | null;
  adminPassword: string | null;
  onPasswordVerified: (password: string) => void;
  onSuccess: (updated: CodeWithIndex) => void;
  onClose: () => void;
};

export function EditCodeModal({
  row,
  adminPassword,
  onPasswordVerified,
  onSuccess,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(row);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const gate = useGatePassword({
    open,
    verify: verifyAddCodePassword,
    onVerified: (password) => onPasswordVerified(password),
  });

  const isVerified = Boolean(adminPassword) || gate.passwordVerified;
  const currentPassword = adminPassword || gate.enteredPassword;

  return (
    <ModalShell
      open={open}
      overlayKey="edit-code-overlay"
      titleId="edit-code-modal-title"
      title={
        !isVerified
          ? "אימות קוד אבטחה לעריכה"
          : `עריכת קוד: ${row?.street ?? ""} ${row?.number ?? ""}`
      }
      onClose={onClose}
      closeButtonRef={closeButtonRef}
      reduceMotion={reduceMotion}
    >
      {!isVerified ? (
        <PasswordGateSection
          label="הזן קוד אבטחה (קוד הוספת קוד) לעריכה"
          enteredPassword={gate.enteredPassword}
          onPasswordChange={gate.setEnteredPassword}
          showPassword={gate.showPassword}
          onToggleShowPassword={gate.toggleShowPassword}
          passwordError={gate.passwordError}
          verifyingPassword={gate.verifyingPassword}
          reduceMotion={reduceMotion}
          onSubmit={(e) => void gate.handlePasswordSubmit(e)}
        />
      ) : row ? (
        <EditCodeForm
          key={row.sheetRowIndex}
          row={row}
          adminPassword={currentPassword}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      ) : null}
    </ModalShell>
  );
}

