"use client";

import { useState } from "react";
import { updateBuildingCode, type CodeWithIndex } from "@/lib/sheet-actions";

type Props = {
  row: CodeWithIndex;
  adminPassword: string;
  onSuccess: (updated: CodeWithIndex) => void;
  onClose: () => void;
};

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none";

export function EditCodeForm({
  row,
  adminPassword,
  onSuccess,
  onClose,
}: Props) {
  const [street, setStreet] = useState(row.street);
  const [number, setNumber] = useState(row.number);
  const [area, setArea] = useState(row.area);
  const [code, setCode] = useState(row.code);
  const [kind, setKind] = useState(row.kind);
  const [note, setNote] = useState(row.note);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!street.trim() || !number.trim() || !code.trim()) {
      setError("חובה למלא רחוב, מספר בית וקוד.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const updatedData: CodeWithIndex = {
      sheetRowIndex: row.sheetRowIndex,
      street: street.trim(),
      number: number.trim(),
      area: area.trim(),
      code: code.trim(),
      kind: kind.trim(),
      note: note.trim(),
    };

    try {
      const result = await updateBuildingCode(
        adminPassword,
        row.sheetRowIndex,
        updatedData,
      );
      if (!result.success) {
        setError(result.error ?? "עדכון הקוד נכשל.");
        return;
      }
      onSuccess(updatedData);
      onClose();
    } catch {
      setError("שגיאת תקשורת עם השרת.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          <span>רחוב *</span>
          <input
            type="text"
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          <span>מספר בית *</span>
          <input
            type="text"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          <span>שכונה / אזור</span>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          <span>סוג (קוד / מפתח / אינטרקום)</span>
          <input
            type="text"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
        <span>קוד כניסה *</span>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${INPUT_CLASS} font-mono text-base font-bold`}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
        <span>הערה</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={INPUT_CLASS}
        />
      </label>

      <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          ביטול
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </form>
  );
}

