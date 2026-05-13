"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ADDRESS_INPUT_CLASS } from "./constants";

type Props = {
  street: string;
  houseNumber: string;
  area: string;
  onStreetChange: (value: string) => void;
  onHouseNumberChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function SearchAddressForm({
  street,
  houseNumber,
  area,
  onStreetChange,
  onHouseNumberChange,
  onAreaChange,
  onSubmit,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-2xl)] border border-white/60 bg-linear-to-b from-[var(--surface-strong)] via-white/[0.93] to-white/88 p-4 shadow-[var(--shadow-card)] ring-1 ring-slate-900/[0.04] backdrop-blur-xl sm:p-6"
      whileHover={
        reduceMotion ? undefined : { boxShadow: "var(--shadow-card), 0 18px 50px -24px rgba(37,99,235,0.15)" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm sm:col-span-2">
          <span className="font-semibold text-slate-800">רחוב</span>
          <input
            type="text"
            value={street}
            onChange={(e) => onStreetChange(e.target.value)}
            placeholder="למשל: העלייה, רבי ינאי…"
            className={ADDRESS_INPUT_CLASS}
            dir="rtl"
            autoComplete="street-address"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-800">מספר בית</span>
          <input
            type="text"
            inputMode="numeric"
            value={houseNumber}
            onChange={(e) => onHouseNumberChange(e.target.value)}
            placeholder="למשל: 7"
            className={ADDRESS_INPUT_CLASS}
            dir="rtl"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">שכונה (אופציונלי)</span>
          <input
            type="text"
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            placeholder="אם צריך לצמצם התאמות"
            className={ADDRESS_INPUT_CLASS}
            dir="rtl"
          />
        </label>
      </div>
      <div className="mt-5">
        <motion.button
          type="submit"
          whileHover={reduceMotion ? undefined : { scale: 1.01 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative min-h-[3.125rem] w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-[0.9rem] text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] md:py-4"
        >
          הצג קוד כניסה
        </motion.button>
        <p className="mt-2 text-center text-xs text-slate-500">
          או הקישו Enter אחרי מילוי השדות
        </p>
      </div>
    </motion.form>
  );
}
