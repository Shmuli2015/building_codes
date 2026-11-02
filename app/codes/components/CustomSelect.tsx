"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  icon?: ReactNode;
  onChange: (value: string) => void;
};

export function CustomSelect({
  label,
  value,
  placeholder,
  options,
  icon,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isSelected = Boolean(value);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {label ? (
        <span className="mb-1 block text-xs font-semibold text-slate-600">
          {label}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white/90 px-3 py-2 text-right text-xs font-medium shadow-xs transition-all ${
          isSelected
            ? "border-blue-400 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/10"
            : "border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <span className={isSelected ? "text-blue-600" : "text-slate-400"}>
              {icon}
            </span>
          ) : null}
          <span className="truncate">{displayLabel}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isSelected ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e as unknown as React.MouseEvent);
              }}
              aria-label="נקה בחירה"
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </span>
          ) : null}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180 text-slate-700" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 max-h-60 w-full min-w-[200px] overflow-y-auto overscroll-contain rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/10"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value || "__all__"}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs transition-colors ${
                  active
                    ? "bg-blue-50 font-bold text-blue-800"
                    : "font-medium text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active ? (
                  <Check className="mr-2 h-3.5 w-3.5 text-blue-600 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
