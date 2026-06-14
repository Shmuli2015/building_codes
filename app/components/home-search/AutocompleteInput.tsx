"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState, useId } from "react";
import { ADDRESS_INPUT_CLASS } from "./constants";

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
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Reset highlighted index when options change or dropdown closes/opens
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [options, isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Keep highlighted item visible on scroll
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev + 1 < options.length ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : options.length - 1
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          e.preventDefault();
          selectOption(options[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const selectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span className="text-slate-700">{text}</span>;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span className="text-slate-700">{text}</span>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <span className="text-slate-700 font-medium">
        {before}
        <span className="font-extrabold text-blue-600">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <label className={`flex flex-col gap-2 text-sm relative ${className}`}>
      <span className="font-semibold text-slate-800">{label}</span>
      <div ref={containerRef} className="relative w-full">
        <input
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${ADDRESS_INPUT_CLASS} pl-10`} // extra left padding for chevron icon
          dir={dir}
          autoComplete={autoComplete}
          required={required}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
        />
        
        {/* Dropdown toggle button on the left edge for RTL */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          tabIndex={-1}
          aria-label={isOpen ? "סגור אפשרויות" : "פתח אפשרויות"}
        >
          <svg
            className={`h-4 w-4 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
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

        {/* Suggestions list */}
        <AnimatePresence>
          {isOpen && options.length > 0 && (
            <m.ul
              ref={listRef}
              id={listboxId}
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
                const isHighlighted = i === highlightedIndex;

                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(i)}
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
