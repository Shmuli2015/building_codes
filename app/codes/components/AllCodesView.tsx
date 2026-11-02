"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BackgroundGlow } from "@/app/components/home-search/BackgroundGlow";
import { WarningsBanner } from "@/app/components/home-search/WarningsBanner";
import { AddCodeModal } from "@/app/components/home-search/AddCodeModal";
import type { AllCodesViewProps } from "../types";
import { useAllCodes } from "../hooks/useAllCodes";
import { CodesHeader } from "./CodesHeader";
import { CodesFilterBar } from "./CodesFilterBar";
import { CodesTableView } from "./CodesTableView";
import { CodesEmptyState } from "./CodesEmptyState";
import { EditCodeModal } from "./EditCodeModal";
import { DeleteCodeModal } from "./DeleteCodeModal";

export function AllCodesView({
  initialRows,
  warnings,
  addCodeEnabled,
}: AllCodesViewProps) {
  const router = useRouter();
  const [addCodeModalOpen, setAddCodeModalOpen] = useState(false);

  const {
    rows,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    selectedKind,
    setSelectedKind,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    filterOptions,
    filteredRows,
    totalCount,
    filteredCount,
    copiedKey,
    copyFailedKey,
    copyCode,
    editingRow,
    setEditingRow,
    deletingRow,
    setDeletingRow,
    adminPassword,
    setAdminPassword,
    updateRowInState,
    deleteRowFromState,
  } = useAllCodes(initialRows);

  const availableStreets = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.street).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "he"),
      ),
    [rows],
  );

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-x-clip">
      <BackgroundGlow />
      <div className="relative z-1 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        <WarningsBanner warnings={warnings} />

        <CodesHeader
          totalCount={totalCount}
          filteredCount={filteredCount}
          onAddCodeClick={
            addCodeEnabled ? () => setAddCodeModalOpen(true) : undefined
          }
        />

        <div className="relative z-30">
          <CodesFilterBar
            searchQuery={searchQuery}
            selectedArea={selectedArea}
            selectedKind={selectedKind}
            sortBy={sortBy}
            filterOptions={filterOptions}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchQuery}
            onAreaChange={setSelectedArea}
            onKindChange={setSelectedKind}
            onSortChange={setSortBy}
            onResetFilters={resetFilters}
          />
        </div>

        <div className="relative z-10">
          {filteredRows.length === 0 ? (
            <CodesEmptyState
              hasFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          ) : (
            <CodesTableView
              rows={filteredRows}
              copiedKey={copiedKey}
              copyFailedKey={copyFailedKey}
              onCopy={copyCode}
              onAreaSelect={setSelectedArea}
              onKindSelect={setSelectedKind}
              onEdit={setEditingRow}
              onDelete={setDeletingRow}
            />
          )}
        </div>
      </div>

      <AddCodeModal
        open={addCodeModalOpen}
        onClose={() => setAddCodeModalOpen(false)}
        addCodeEnabled={addCodeEnabled}
        availableStreets={availableStreets}
        availableAreas={filterOptions.areas}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <EditCodeModal
        row={editingRow}
        adminPassword={adminPassword}
        onPasswordVerified={setAdminPassword}
        onSuccess={updateRowInState}
        onClose={() => setEditingRow(null)}
      />

      <DeleteCodeModal
        row={deletingRow}
        adminPassword={adminPassword}
        onPasswordVerified={setAdminPassword}
        onSuccess={deleteRowFromState}
        onClose={() => setDeletingRow(null)}
      />
    </div>
  );
}
