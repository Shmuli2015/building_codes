"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { verifyAddCodePassword } from "@/lib/sheet-actions";
import { AddressConflictModal } from "./AddressConflictModal";
import { CodeFormFields } from "./CodeFormFields";
import { ModalShell } from "./ModalShell";
import { PasswordGateSection } from "./PasswordGateSection";
import { useAddCodeForm } from "./hooks/useAddCodeForm";
import { useGatePassword } from "./hooks/useGatePassword";

type Props = {
  open: boolean;
  onClose: () => void;
  addCodeEnabled?: boolean;
  availableStreets?: string[];
  availableAreas?: string[];
  onSuccess: () => void;
};

export function AddCodeModal({
  open,
  onClose,
  addCodeEnabled,
  availableStreets = [],
  availableAreas = [],
  onSuccess,
}: Props) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const gate = useGatePassword({
    open,
    verify: verifyAddCodePassword,
  });

  const form = useAddCodeForm({
    open,
    addCodeEnabled,
    availableStreets,
    availableAreas,
    enteredPassword: gate.enteredPassword,
    onSuccess,
    onClose,
  });

  return (
    <>
      <ModalShell
        open={open}
        overlayKey="add-code-overlay"
        titleId="add-code-modal-title"
        title={
          !gate.passwordVerified ? "אימות קוד אבטחה" : "הוספת קוד כניסה חדש"
        }
        onClose={onClose}
        closeButtonRef={closeButtonRef}
        reduceMotion={reduceMotion}
      >
        {!gate.passwordVerified ? (
          <PasswordGateSection
            label="הזן קוד אבטחה להוספה"
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
          <CodeFormFields
            street={form.street}
            onStreetChange={form.setStreet}
            streetOptions={form.streetOptions}
            houseNumber={form.houseNumber}
            onHouseNumberChange={form.setHouseNumber}
            code={form.code}
            onCodeChange={form.setCode}
            area={form.area}
            onAreaChange={form.setArea}
            areaOptions={form.areaOptions}
            selectedKind={form.selectedKind}
            onKindChange={form.handleKindChange}
            customKind={form.customKind}
            onCustomKindChange={form.setCustomKind}
            note={form.note}
            onNoteChange={form.setNote}
            error={form.error}
            success={form.success}
            successMessage={form.successMessage}
            submitting={form.submitting}
            reduceMotion={reduceMotion}
            onSubmit={form.handleSubmit}
          />
        )}
      </ModalShell>
      <AddressConflictModal
        open={form.conflictOpen}
        step={form.conflictStep}
        matches={form.existingMatches}
        street={form.street.trim()}
        houseNumber={form.houseNumber.trim()}
        area={form.area.trim() || undefined}
        selectedSheetRowIndex={form.selectedSheetRowIndex}
        processing={form.conflictProcessing}
        onClose={form.handleConflictClose}
        onChooseEdit={form.handleChooseEdit}
        onChooseAddNew={() => void form.handleChooseAddNew()}
        onSelectRow={form.setSelectedSheetRowIndex}
        onConfirmEdit={() => void form.handleConfirmEdit()}
        onBack={() => form.setConflictStep("choose")}
      />
    </>
  );
}
