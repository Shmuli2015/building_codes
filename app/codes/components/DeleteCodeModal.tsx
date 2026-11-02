"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  deleteBuildingCode,
  verifyAddCodePassword,
  type CodeWithIndex,
} from "@/lib/sheet-actions";
import { ModalShell } from "@/app/components/home-search/ModalShell";
import { PasswordGateSection } from "@/app/components/home-search/PasswordGateSection";
import { useGatePassword } from "@/app/components/home-search/hooks/useGatePassword";

type Props = {
  row: CodeWithIndex | null;
  adminPassword: string | null;
  onPasswordVerified: (password: string) => void;
  onSuccess: (sheetRowIndex: number) => void;
  onClose: () => void;
};

type ConfirmProps = {
  row: CodeWithIndex;
  adminPassword: string;
  onSuccess: (sheetRowIndex: number) => void;
  onClose: () => void;
};

function DeleteConfirmContent({
  row,
  adminPassword,
  onSuccess,
  onClose,
}: ConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const result = await deleteBuildingCode(adminPassword, row.sheetRowIndex);
      if (!result.success) {
        setError(result.error ?? "מחיקת הקוד נכשלה.");
        return;
      }
      onSuccess(row.sheetRowIndex);
      onClose();
    } catch {
      setError("שגיאת תקשורת עם השרת.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">
            {row.street} {row.number}
          </p>
          <p className="text-xs text-slate-500">
            קוד: <span className="font-mono font-bold">{row.code}</span>
            {row.area ? ` · ${row.area}` : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600">
        האם אתה בטוח שברצונך למחוק קוד כניסה זה? פעולה זו תסיר את השורה לצמיתות מגיליון הנתונים.
      </p>

      <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
        >
          {deleting ? "מוחק..." : "מחק קוד לצמיתות"}
        </button>
      </div>
    </div>
  );
}

export function DeleteCodeModal({
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
      overlayKey="delete-code-overlay"
      titleId="delete-code-modal-title"
      title={!isVerified ? "אימות קוד אבטחה למחיקה" : "אישור מחיקת קוד"}
      onClose={onClose}
      closeButtonRef={closeButtonRef}
      reduceMotion={reduceMotion}
    >
      {!isVerified ? (
        <PasswordGateSection
          label="הזן קוד אבטחה (קוד הוספת קוד) למחיקה"
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
        <DeleteConfirmContent
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
