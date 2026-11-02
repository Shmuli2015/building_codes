"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

import { BackgroundGlow } from "./BackgroundGlow";
import { HomeSearchHeader } from "./HomeSearchHeader";
import { LoadErrorAlert } from "./LoadErrorAlert";
import { staggerContainer, staggerItem } from "./motion-config";
import type { HomeSearchProps } from "./types";
import { SearchAddressForm } from "./SearchAddressForm";
import { SheetToolbar } from "./SheetToolbar";
import { WarningsBanner } from "./WarningsBanner";
import { useHomeSearchState } from "./hooks/useHomeSearchState";

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
  const state = useHomeSearchState({ initial });

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
                loading={state.loading}
                onRefresh={() => void state.load(true)}
                lastFetch={state.lastFetch}
                onAddCodeClick={
                  addCodeEnabled
                    ? () => state.setAddCodeModalOpen(true)
                    : undefined
                }
                onAddAuthorizedClick={
                  addAuthorizedEnabled
                    ? () => state.setAddAuthorizedModalOpen(true)
                    : undefined
                }
              />
              <HomeSearchHeader />
            </m.header>

            <m.div variants={itemVariants}>
              <LoadErrorAlert message={state.loadError} />
            </m.div>

            <m.div variants={itemVariants}>
              <WarningsBanner warnings={state.warnings} />
            </m.div>

            <m.div variants={itemVariants}>
              <SearchAddressForm
                street={state.street}
                houseNumber={state.houseNumber}
                area={state.area}
                availableStreets={state.availableStreets}
                availableHouseNumbers={state.availableHouseNumbers}
                availableAreas={state.availableAreas}
                onStreetChange={state.setStreet}
                onHouseNumberChange={state.setHouseNumber}
                onAreaChange={state.setArea}
                onSubmit={(e) => void state.handleFormSubmit(e)}
                onClear={state.handleClear}
                searching={state.searching}
              />
            </m.div>
          </m.div>

          <ResultModal
            open={state.resultModalOpen}
            onClose={state.closeModal}
            closeButtonRef={state.closeButtonRef}
            street={state.street}
            houseNumber={state.houseNumber}
            matches={state.matches}
            copiedRowKey={state.copiedRowKey}
            failedCopyKey={state.failedCopyKey}
            onCopy={state.copyCode}
          />
          <AddCodeModal
            open={state.addCodeModalOpen}
            onClose={() => state.setAddCodeModalOpen(false)}
            addCodeEnabled={addCodeEnabled}
            availableStreets={state.availableStreets}
            availableAreas={state.availableAreas}
            onSuccess={() => void state.load(true)}
          />
          <AddAuthorizedModal
            open={state.addAuthorizedModalOpen}
            onClose={() => state.setAddAuthorizedModalOpen(false)}
            addAuthorizedEnabled={addAuthorizedEnabled}
            currentUserEmail={currentUserEmail}
            onSuccess={() => {}}
          />
        </div>
      </div>
    </LazyMotion>
  );
}
