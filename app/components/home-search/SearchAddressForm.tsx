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
      className="rounded-3xl border border-white/70 bg-linear-to-b from-white/95 to-white/80 p-5 shadow-2xl shadow-indigo-950/10 ring-1 ring-blue-500/10 backdrop-blur-xl sm:p-7"
      whileHover={reduceMotion ? undefined : { boxShadow: "0 25px 50px -12px rgba(30, 58, 138, 0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
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
      <div className="mt-7">
        <motion.button
          type="submit"
          whileHover={reduceMotion ? undefined : { scale: 1.01 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-violet-600 px-5 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/35 ring-1 ring-white/30 transition-[filter] hover:brightness-110 active:brightness-95"
        >
          הצג קוד
        </motion.button>
        <p className="mt-3 text-center text-xs text-slate-500">
          או הקישו Enter אחרי מילוי השדות
        </p>
      </div>
    </motion.form>
  );
}
