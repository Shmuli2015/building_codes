"use client";

import { m, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { capDatalistOptions } from "@/lib/search-index";
import { AutocompleteInput } from "./AutocompleteInput";

type Props = {
  street: string;
  houseNumber: string;
  area: string;
  availableStreets?: string[];
  availableHouseNumbers?: string[];
  availableAreas?: string[];
  onStreetChange: (value: string) => void;
  onHouseNumberChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  onClear: () => void;
  searching?: boolean;
};

export function SearchAddressForm({
  street,
  houseNumber,
  area,
  availableStreets = [],
  availableHouseNumbers = [],
  availableAreas = [],
  onStreetChange,
  onHouseNumberChange,
  onAreaChange,
  onSubmit,
  onClear,
  searching = false,
}: Props) {
  const reduceMotion = useReducedMotion();

  const streetOptions = useMemo(
    () => capDatalistOptions(availableStreets, street),
    [availableStreets, street],
  );
  const houseNumberOptions = useMemo(
    () => capDatalistOptions(availableHouseNumbers, houseNumber),
    [availableHouseNumbers, houseNumber],
  );
  const areaOptions = useMemo(
    () => capDatalistOptions(availableAreas, area),
    [availableAreas, area],
  );

  const isSubmitDisabled = !street.trim() || !houseNumber.trim() || searching;

  return (
    <m.form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/60 bg-linear-to-b from-(--surface-strong) via-white/93 to-white/88 p-4 shadow-(--shadow-card) ring-1 ring-slate-900/4 backdrop-blur-xl sm:p-6"
      whileHover={
        reduceMotion ? undefined : { boxShadow: "var(--shadow-card), 0 18px 50px -24px rgba(37,99,235,0.15)" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AutocompleteInput
          label="רחוב"
          value={street}
          onChange={onStreetChange}
          options={streetOptions}
          placeholder="למשל: העלייה, רבי ינאי…"
          className="sm:col-span-2"
        />
        <AutocompleteInput
          label="מספר בית"
          value={houseNumber}
          onChange={onHouseNumberChange}
          options={houseNumberOptions}
          placeholder="למשל: 7"
          inputMode="numeric"
        />
        <AutocompleteInput
          label="שכונה (אופציונלי)"
          value={area}
          onChange={onAreaChange}
          options={areaOptions}
          placeholder="אם צריך לצמצם התאמות"
        />
      </div>
      <div className="mt-6 flex flex-col items-center gap-3">
        <m.button
          type="submit"
          disabled={isSubmitDisabled}
          whileHover={reduceMotion || isSubmitDisabled ? undefined : { scale: 1.01 }}
          whileTap={reduceMotion || isSubmitDisabled ? undefined : { scale: 0.99 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="relative min-h-12.5 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-[0.9rem] text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.3] md:py-4"
        >
          {searching ? "מחפש…" : "הצג קוד כניסה"}
        </m.button>

        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          נקה הכל
        </button>
      </div>
    </m.form>
  );
}
