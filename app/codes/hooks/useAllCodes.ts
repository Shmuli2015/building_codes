"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CodeWithIndex } from "@/lib/sheet-actions";
import type { CodeSortOption } from "../types";
import { extractFilterOptions, filterAndSortCodes } from "../helpers/filterCodes";

export function useAllCodes(initialRows: CodeWithIndex[]) {
  const [rows, setRows] = useState<CodeWithIndex[]>(initialRows);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedKind, setSelectedKind] = useState("");
  const [sortBy, setSortBy] = useState<CodeSortOption>("street");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyFailedKey, setCopyFailedKey] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<CodeWithIndex | null>(null);
  const [deletingRow, setDeletingRow] = useState<CodeWithIndex | null>(null);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const copyResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeout.current) {
        clearTimeout(copyResetTimeout.current);
      }
    };
  }, []);

  const filterOptions = useMemo(
    () => extractFilterOptions(rows),
    [rows],
  );

  const copyCode = useCallback(async (code: string, rowKey: string) => {
    if (copyResetTimeout.current) {
      clearTimeout(copyResetTimeout.current);
      copyResetTimeout.current = null;
    }
    setCopyFailedKey(null);

    try {
      await navigator.clipboard.writeText(code);
      setCopiedKey(rowKey);
      copyResetTimeout.current = setTimeout(() => {
        setCopiedKey(null);
        copyResetTimeout.current = null;
      }, 2000);
    } catch {
      setCopiedKey(null);
      setCopyFailedKey(rowKey);
      copyResetTimeout.current = setTimeout(() => {
        setCopyFailedKey(null);
        copyResetTimeout.current = null;
      }, 2800);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedArea("");
    setSelectedKind("");
  }, []);

  const updateRowInState = useCallback((updated: CodeWithIndex) => {
    setRows((prev) =>
      prev.map((r) =>
        r.sheetRowIndex === updated.sheetRowIndex ? updated : r,
      ),
    );
  }, []);

  const deleteRowFromState = useCallback((sheetRowIndex: number) => {
    setRows((prev) => prev.filter((r) => r.sheetRowIndex !== sheetRowIndex));
  }, []);

  const replaceRows = useCallback((newRows: CodeWithIndex[]) => {
    setRows(newRows);
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedArea || selectedKind,
  );

  const filteredRows = useMemo(
    () =>
      filterAndSortCodes(rows, {
        searchQuery,
        selectedArea,
        selectedKind,
        sortBy,
      }),
    [rows, searchQuery, selectedArea, selectedKind, sortBy],
  );

  return {
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
    totalCount: rows.length,
    filteredCount: filteredRows.length,
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
    replaceRows,
  };
}
