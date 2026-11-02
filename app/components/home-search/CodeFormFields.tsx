"use client";

import { m } from "framer-motion";
import { AutocompleteInput } from "./AutocompleteInput";
import { ADDRESS_INPUT_CLASS } from "./constants";

type Props = {
  street: string;
  onStreetChange: (value: string) => void;
  streetOptions: string[];
  houseNumber: string;
  onHouseNumberChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  areaOptions: string[];
  selectedKind: string;
  onKindChange: (value: string) => void;
  customKind: string;
  onCustomKindChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  error: string | null;
  success: boolean;
  successMessage: string;
  submitting: boolean;
  reduceMotion: boolean | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
};

const SELECT_CLASS = `${ADDRESS_INPUT_CLASS} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_auto] bg-[position:left_1rem_center] bg-no-repeat`;

export function CodeFormFields({
  street,
  onStreetChange,
  streetOptions,
  houseNumber,
  onHouseNumberChange,
  code,
  onCodeChange,
  area,
  onAreaChange,
  areaOptions,
  selectedKind,
  onKindChange,
  customKind,
  onCustomKindChange,
  note,
  onNoteChange,
  error,
  success,
  successMessage,
  submitting,
  reduceMotion,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
    >
      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-800"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <AutocompleteInput
          label="רחוב *"
          value={street}
          onChange={onStreetChange}
          options={streetOptions}
          placeholder="למשל: העלייה, ינאי..."
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-800">מספר בית *</span>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => onHouseNumberChange(e.target.value)}
              placeholder="למשל: 3"
              className={ADDRESS_INPUT_CLASS}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-800">קוד *</span>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="למשל: 1234"
              className={ADDRESS_INPUT_CLASS}
              required
            />
          </label>
        </div>

        <AutocompleteInput
          label="אזור / שכונה (אופציונלי)"
          value={area}
          onChange={onAreaChange}
          options={areaOptions}
          placeholder="למשל: רמת בית שמש א'"
        />

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-800">סוג קוד</span>
          <select
            value={selectedKind}
            onChange={(e) => onKindChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="בניין">בניין</option>
            <option value="מעלית">מעלית</option>
            <option value="אחר">אחר...</option>
          </select>
        </label>

        {selectedKind === "אחר" && (
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-800">
              הזן סוג קוד מותאם אישית *
            </span>
            <input
              type="text"
              value={customKind}
              onChange={(e) => onCustomKindChange(e.target.value)}
              placeholder="למשל: אינטרקום, שער, מחסן..."
              className={ADDRESS_INPUT_CLASS}
              required
            />
          </label>
        )}

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-800">הערה (אופציונלי)</span>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="הערות לגבי הקוד או דרך ההפעלה..."
            className={`${ADDRESS_INPUT_CLASS} min-h-20 py-2 resize-none`}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <m.button
          type="submit"
          disabled={submitting || success}
          whileHover={
            reduceMotion || submitting || success ? undefined : { scale: 1.01 }
          }
          whileTap={
            reduceMotion || submitting || success ? undefined : { scale: 0.99 }
          }
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.3]"
        >
          {submitting ? "שומר קוד כניסה..." : "שמור קוד כניסה"}
        </m.button>
      </div>
    </form>
  );
}
