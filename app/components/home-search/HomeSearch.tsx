"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BuildingCodeRow } from "@/lib/building-codes";
import { filterRows } from "@/lib/normalize";

import { BackgroundGlow } from "./BackgroundGlow";
import { HomeSearchHeader } from "./HomeSearchHeader";
import { LoadErrorAlert } from "./LoadErrorAlert";
import { staggerContainer, staggerItem } from "./motion-config";
import type { ApiResponse, HomeSearchProps } from "./types";
import { ResultModal } from "./ResultModal";
import { SearchAddressForm } from "./SearchAddressForm";
import { SheetToolbar } from "./SheetToolbar";
import { WarningsBanner } from "./WarningsBanner";

export default function HomeSearch({ initial }: HomeSearchProps) {
  const reduceMotion = useReducedMotion();
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [area, setArea] = useState("");
  const [rows, setRows] = useState<BuildingCodeRow[]>(initial.rows);
  const [warnings, setWarnings] = useState<string[]>(initial.warnings);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(initial.fetchedAt);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedRowKey, setCopiedRowKey] = useState<string | null>(null);
  const [failedCopyKey, setFailedCopyKey] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    setLoadError(null);
    try {
      const url = refresh ? "/api/codes?refresh=1" : "/api/codes";
      const res = await fetch(url, { cache: "no-store" });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setLoadError(data.error ?? "טעינה נכשלה");
        return;
      }
      setRows(data.rows ?? []);
      setWarnings(data.warnings ?? []);
      setLastFetch(data.fetchedAt ?? null);
    } catch {
      setLoadError("לא ניתן להתחבר לשרת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }, []);

  const matches = useMemo(() => {
    if (!street.trim() || !houseNumber.trim()) return [];
    return filterRows(rows, street, houseNumber, area || undefined);
  }, [rows, street, houseNumber, area]);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const openResultsModal = useCallback(() => {
    setResultModalOpen(true);
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openResultsModal();
  };

  const containerVariants = staggerContainer(reduceMotion);
  const itemVariants = staggerItem(reduceMotion);

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-x-clip">
      <BackgroundGlow />
      <div className="relative z-[1] mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4 sm:px-5 sm:py-6 md:py-8">
        <motion.div
          className="flex w-full flex-1 flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-1 sm:gap-1.5"
          >
            <SheetToolbar
              loading={loading}
              onRefresh={() => void load(true)}
              lastFetch={lastFetch}
            />
            <HomeSearchHeader />
          </motion.div>

          <motion.div variants={itemVariants}>
            <LoadErrorAlert message={loadError} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <WarningsBanner warnings={warnings} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SearchAddressForm
              street={street}
              houseNumber={houseNumber}
              area={area}
              onStreetChange={setStreet}
              onHouseNumberChange={setHouseNumber}
              onAreaChange={setArea}
              onSubmit={handleFormSubmit}
            />
          </motion.div>
        </motion.div>

        <ResultModal
          open={resultModalOpen}
          onClose={closeModal}
          closeButtonRef={closeButtonRef}
          street={street}
          houseNumber={houseNumber}
          matches={matches}
          copiedRowKey={copiedRowKey}
          failedCopyKey={failedCopyKey}
          onCopy={copyCode}
        />
      </div>
    </div>
  );
}
