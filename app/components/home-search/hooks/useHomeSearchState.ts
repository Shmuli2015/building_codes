"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { BuildingCodeRow } from "@/lib/building-codes";
import { getHouseNumbersForStreet } from "@/lib/search-index";
import type { ApiResponse, HomeSearchProps, SearchApiResponse } from "../types";

export function useHomeSearchState({
  initial,
}: Pick<HomeSearchProps, "initial">) {
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [area, setArea] = useState("");
  const [index, setIndex] = useState(initial.index);
  const [warnings, setWarnings] = useState<string[]>(initial.warnings);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(initial.fetchedAt);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [addCodeModalOpen, setAddCodeModalOpen] = useState(false);
  const [addAuthorizedModalOpen, setAddAuthorizedModalOpen] = useState(false);
  const [matches, setMatches] = useState<BuildingCodeRow[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedRowKey, setCopiedRowKey] = useState<string | null>(null);
  const [failedCopyKey, setFailedCopyKey] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deferredStreet = useDeferredValue(street);

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    setLoadError(null);
    try {
      const url = refresh ? "/api/codes?refresh=1" : "/api/codes";
      const res = await fetch(url, refresh ? { cache: "no-store" } : undefined);
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setLoadError(data.error ?? "טעינה נכשלה");
        return;
      }
      setIndex(data.index);
      setWarnings(data.warnings ?? []);
      setLastFetch(data.fetchedAt ?? null);
    } catch {
      setLoadError("לא ניתן להתחבר לשרת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }, []);

  const availableStreets = useMemo(() => index.streets, [index.streets]);
  const availableAreas = useMemo(() => index.areas, [index.areas]);
  const availableHouseNumbers = useMemo(
    () => getHouseNumbersForStreet(index, deferredStreet),
    [index, deferredStreet],
  );

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const copyCode = useCallback(async (code: string, rowKey: string) => {
    if (copyResetRef.current) {
      clearTimeout(copyResetRef.current);
      copyResetRef.current = null;
    }
    setFailedCopyKey(null);

    try {
      await navigator.clipboard.writeText(code);
      setCopiedRowKey(rowKey);
      copyResetRef.current = setTimeout(() => {
        setCopiedRowKey(null);
        copyResetRef.current = null;
      }, 2000);
    } catch {
      setCopiedRowKey(null);
      setFailedCopyKey(rowKey);
      copyResetRef.current = setTimeout(() => {
        setFailedCopyKey(null);
        copyResetRef.current = null;
      }, 2800);
    }
  }, []);

  const closeModal = useCallback(() => {
    setResultModalOpen(false);
    setCopiedRowKey(null);
    setFailedCopyKey(null);
    if (copyResetRef.current) {
      clearTimeout(copyResetRef.current);
      copyResetRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!resultModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [resultModalOpen, closeModal]);

  const handleClear = useCallback(() => {
    setStreet("");
    setHouseNumber("");
    setArea("");
  }, []);

  const handleFormSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSearching(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams({
          street: street.trim(),
          number: houseNumber.trim(),
        });
        if (area.trim()) {
          params.set("area", area.trim());
        }
        const res = await fetch(`/api/codes/search?${params}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as SearchApiResponse;
        if (!res.ok) {
          setLoadError(data.error ?? "חיפוש נכשל");
          return;
        }
        setMatches(data.matches ?? []);
        setResultModalOpen(true);
      } catch {
        setLoadError("לא ניתן לבצע חיפוש. נסו שוב.");
      } finally {
        setSearching(false);
      }
    },
    [street, houseNumber, area],
  );

  return {
    street,
    setStreet,
    houseNumber,
    setHouseNumber,
    area,
    setArea,
    warnings,
    loading,
    searching,
    loadError,
    lastFetch,
    resultModalOpen,
    addCodeModalOpen,
    setAddCodeModalOpen,
    addAuthorizedModalOpen,
    setAddAuthorizedModalOpen,
    matches,
    closeButtonRef,
    copiedRowKey,
    failedCopyKey,
    availableStreets,
    availableAreas,
    availableHouseNumbers,
    load,
    copyCode,
    closeModal,
    handleClear,
    handleFormSubmit,
  };
}
