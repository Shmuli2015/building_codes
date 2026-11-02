"use client";

import { AnimatePresence, m } from "framer-motion";
import { ADDRESS_INPUT_CLASS } from "./constants";
import { highlightMatch } from "./helpers/highlightMatch";
import { useAutocompleteInput } from "./hooks/useAutocompleteInput";

type AutocompleteInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  dir?: "rtl" | "ltr";
  autoComplete?: string;
  required?: boolean;
  className?: string;
};

export function AutocompleteInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  inputMode,
  type = "text",
  dir = "rtl",
  autoComplete = "off",
  required = false,
  className = "",
}: AutocompleteInputProps) {
  const ac = useAutocompleteInput({ options, onChange });

  return (
    <label className={`flex flex-col gap-2 text-sm relative ${className}`}>
      <span className="font-semibold text-slate-800">{label}</span>
      <div ref={ac.containerRef} className="relative w-full">
        <input
          ref={ac.inputRef}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => ac.handleValueChange(e.target.value)}
          onFocus={ac.handleFocus}
          onKeyDown={ac.handleKeyDown}
          placeholder={placeholder}
          className={`${ADDRESS_INPUT_CLASS} pl-10`}
          dir={dir}
          autoComplete={autoComplete}
          required={required}
          role="combobox"
          aria-expanded={ac.isOpen}
          aria-autocomplete="list"
          aria-controls={ac.listboxId}
        />
        <button
          type="button"
          onClick={ac.toggleOpen}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          tabIndex={-1}
          aria-label={ac.isOpen ? "סגור אפשרויות" : "פתח אפשרויות"}
        >
          <svg
            className={`h-4 w-4 transform transition-transform duration-200 ${
              ac.isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <AnimatePresence>
          {ac.isOpen && options.length > 0 && (
            <m.ul
              ref={ac.listRef}
              id={ac.listboxId}
              role="listbox"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl shadow-slate-100/50 backdrop-blur-xl focus:outline-none"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              {options.map((opt, i) => {
                const isSelected = value === opt;
                const isHighlighted = i === ac.highlightedIndex;

                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => ac.selectOption(opt)}
                    onMouseEnter={() => ac.setHighlightedIndex(i)}
                    className={`cursor-pointer select-none rounded-xl px-3.5 py-2.5 text-right text-sm transition-colors duration-100 ${
                      isSelected
                        ? "bg-blue-50/70 text-blue-700 font-semibold"
                        : isHighlighted
                          ? "bg-slate-50 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    {highlightMatch(opt, value)}
                  </li>
                );
              })}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </label>
  );
}
