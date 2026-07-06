"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
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

import { BackgroundGlow } from "./BackgroundGlow";
import { HomeSearchHeader } from "./HomeSearchHeader";
import { LoadErrorAlert } from "./LoadErrorAlert";
import { staggerContainer, staggerItem } from "./motion-config";
import type { ApiResponse, HomeSearchProps, SearchApiResponse } from "./types";
import { SearchAddressForm } from "./SearchAddressForm";
import { SheetToolbar } from "./SheetToolbar";
import { WarningsBanner } from "./WarningsBanner";

const ResultModal = dynamic(
  () => import("./ResultModal").then((mod) => ({ default: mod.ResultModal })),
  { ssr: false },
);

const AddCodeModal = dynamic(
  () => import("./AddCodeModal").then((mod) => ({ default: mod.AddCodeModal })),
  { ssr: false },
);

const AddAuthorizedModal = dynamic(
  () =>
    import("./AddAuthorizedModal").then((mod) => ({
      default: mod.AddAuthorizedModal,
    })),
  { ssr: false },
);

export default function HomeSearch({
  initial,
  addCodeEnabled,
  addAuthorizedEnabled,
  currentUserEmail,
}: HomeSearchProps) {
  const reduceMotion = useReducedMotion();
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

  const containerVariants = staggerContainer(reduceMotion);
  const itemVariants = staggerItem(reduceMotion);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative flex w-full flex-1 flex-col overflow-x-clip">
        <BackgroundGlow />
        <div className="relative z-1 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-3 sm:px-5 sm:py-5">
          <m.div
            className="flex w-full flex-1 flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <m.header
              variants={itemVariants}
              aria-label="כותרת ופעולות"
              className="flex flex-col gap-2"
            >
              <SheetToolbar
                loading={loading}
                onRefresh={() => void load(true)}
                lastFetch={lastFetch}
                onAddCodeClick={
                  addCodeEnabled
                    ? () => setAddCodeModalOpen(true)
                    : undefined
                }
                onAddAuthorizedClick={
                  addAuthorizedEnabled
                    ? () => setAddAuthorizedModalOpen(true)
                    : undefined
                }
              />
              <HomeSearchHeader />
            </m.header>

            <m.div variants={itemVariants}>
              <LoadErrorAlert message={loadError} />
            </m.div>

            <m.div variants={itemVariants}>
              <WarningsBanner warnings={warnings} />
            </m.div>

            <m.div variants={itemVariants}>
              <SearchAddressForm
                street={street}
                houseNumber={houseNumber}
                area={area}
                availableStreets={availableStreets}
                availableHouseNumbers={availableHouseNumbers}
                availableAreas={availableAreas}
                onStreetChange={setStreet}
                onHouseNumberChange={setHouseNumber}
                onAreaChange={setArea}
                onSubmit={(e) => void handleFormSubmit(e)}
                onClear={handleClear}
                searching={searching}
              />
            </m.div>
          </m.div>

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
          <AddCodeModal
            open={addCodeModalOpen}
            onClose={() => setAddCodeModalOpen(false)}
            addCodeEnabled={addCodeEnabled}
            availableStreets={availableStreets}
            availableAreas={availableAreas}
            onSuccess={() => void load(true)}
          />
          <AddAuthorizedModal
            open={addAuthorizedModalOpen}
            onClose={() => setAddAuthorizedModalOpen(false)}
            addAuthorizedEnabled={addAuthorizedEnabled}
            currentUserEmail={currentUserEmail}
            onSuccess={() => {}}
          />
        </div>
      </div>
    </LazyMotion>
  );
}
