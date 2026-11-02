"use client";

import { useEffect, useId, useRef, useState } from "react";

type UseAutocompleteInputOptions = {
  options: string[];
  onChange: (value: string) => void;
};

export function useAutocompleteInput({
  options,
  onChange,
}: UseAutocompleteInputOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const ignoreNextFocus = useRef(false);

  const [prevOptions, setPrevOptions] = useState(options);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (options !== prevOptions || isOpen !== prevIsOpen) {
    setPrevOptions(options);
    setPrevIsOpen(isOpen);
    setHighlightedIndex(-1);
  }

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

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const selectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    ignoreNextFocus.current = true;
    inputRef.current?.focus();
  };

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
          prev + 1 < options.length ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : options.length - 1,
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

  const toggleOpen = () => {
    const nextOpen = !isOpen;
    if (!nextOpen) {
      ignoreNextFocus.current = true;
    }
    setIsOpen(nextOpen);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (ignoreNextFocus.current) {
      ignoreNextFocus.current = false;
      return;
    }
    setIsOpen(true);
  };

  const handleValueChange = (value: string) => {
    onChange(value);
    setIsOpen(true);
  };

  return {
    isOpen,
    highlightedIndex,
    setHighlightedIndex,
    containerRef,
    inputRef,
    listRef,
    listboxId,
    selectOption,
    handleKeyDown,
    toggleOpen,
    handleFocus,
    handleValueChange,
  };
}
