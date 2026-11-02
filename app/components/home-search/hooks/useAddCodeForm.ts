"use client";

import { useEffect, useMemo, useState } from "react";
import { capDatalistOptions } from "@/lib/search-index";
import type { BuildingCodeRow } from "@/lib/building-codes";
import {
  addBuildingCode,
  findAddressMatches,
  updateBuildingCode,
  type AddressMatch,
} from "@/lib/sheet-actions";
import type { ConflictStep } from "../AddressConflictModal";

type UseAddCodeFormOptions = {
  open: boolean;
  addCodeEnabled?: boolean;
  availableStreets: string[];
  availableAreas: string[];
  enteredPassword: string;
  onSuccess: () => void;
  onClose: () => void;
};

export function useAddCodeForm({
  open,
  addCodeEnabled,
  availableStreets,
  availableAreas,
  enteredPassword,
  onSuccess,
  onClose,
}: UseAddCodeFormOptions) {
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [code, setCode] = useState("");
  const [selectedKind, setSelectedKind] = useState("בניין");
  const [customKind, setCustomKind] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "הקוד נשמר בהצלחה! מרענן נתונים...",
  );

  const [existingMatches, setExistingMatches] = useState<AddressMatch[]>([]);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictStep, setConflictStep] = useState<ConflictStep>("choose");
  const [selectedSheetRowIndex, setSelectedSheetRowIndex] = useState<
    number | null
  >(null);
  const [conflictProcessing, setConflictProcessing] = useState(false);

  const streetOptions = useMemo(
    () => capDatalistOptions(availableStreets, street),
    [availableStreets, street],
  );

  const areaOptions = useMemo(
    () => capDatalistOptions(availableAreas, area),
    [availableAreas, area],
  );

  useEffect(() => {
    if (!open) return;
    setArea("");
    setStreet("");
    setHouseNumber("");
    setCode("");
    setSelectedKind("בניין");
    setCustomKind("");
    setNote("");
    setError(null);
    setSuccess(false);
    setSuccessMessage("הקוד נשמר בהצלחה! מרענן נתונים...");
    setExistingMatches([]);
    setConflictOpen(false);
    setConflictStep("choose");
    setSelectedSheetRowIndex(null);
    setConflictProcessing(false);
  }, [open]);

  const buildRowData = (): BuildingCodeRow => {
    const finalKind =
      selectedKind === "אחר" ? customKind.trim() || "אחר" : selectedKind;
    return {
      area: area.trim(),
      street: street.trim(),
      number: houseNumber.trim(),
      code: code.trim(),
      kind: finalKind.trim(),
      note: note.trim(),
    };
  };

  const handleSaveSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccess(true);
    setConflictOpen(false);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  const saveNewCode = async () => {
    const result = await addBuildingCode(enteredPassword, buildRowData());
    if (result.success) {
      handleSaveSuccess("הקוד נשמר בהצלחה! מרענן נתונים...");
    } else {
      setError(result.error ?? "אירעה שגיאה בשמירת הקוד.");
      setConflictOpen(false);
    }
    return result.success;
  };

  const saveUpdatedCode = async (sheetRowIndex: number) => {
    const result = await updateBuildingCode(
      enteredPassword,
      sheetRowIndex,
      buildRowData(),
    );
    if (result.success) {
      handleSaveSuccess("הקוד עודכן בהצלחה! מרענן נתונים...");
    } else {
      setError(result.error ?? "אירעה שגיאה בעדכון הקוד.");
      setConflictOpen(false);
    }
    return result.success;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addCodeEnabled) return;

    if (!street.trim() || !houseNumber.trim() || !code.trim()) {
      setError("נא למלא את כל שדות החובה (רחוב, מספר בית וקוד).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { matches } = await findAddressMatches(
        street.trim(),
        houseNumber.trim(),
        area.trim() || undefined,
      );

      if (matches.length > 0) {
        setExistingMatches(matches);
        setConflictStep("choose");
        setSelectedSheetRowIndex(
          matches.length === 1 ? matches[0].sheetRowIndex : null,
        );
        setConflictOpen(true);
        return;
      }

      await saveNewCode();
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChooseAddNew = async () => {
    setConflictProcessing(true);
    setError(null);
    try {
      await saveNewCode();
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setConflictProcessing(false);
      setSubmitting(false);
    }
  };

  const handleChooseEdit = () => {
    if (existingMatches.length === 1) {
      void (async () => {
        setConflictProcessing(true);
        setError(null);
        try {
          await saveUpdatedCode(existingMatches[0].sheetRowIndex);
        } catch (err) {
          setError("שגיאת תקשורת. נא לנסות שוב.");
          console.error(err);
        } finally {
          setConflictProcessing(false);
          setSubmitting(false);
        }
      })();
      return;
    }

    setConflictStep("pickRow");
    if (selectedSheetRowIndex == null && existingMatches.length > 0) {
      setSelectedSheetRowIndex(existingMatches[0].sheetRowIndex);
    }
  };

  const handleConfirmEdit = async () => {
    if (selectedSheetRowIndex == null) return;

    setConflictProcessing(true);
    setError(null);
    try {
      await saveUpdatedCode(selectedSheetRowIndex);
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setConflictProcessing(false);
      setSubmitting(false);
    }
  };

  const handleConflictClose = () => {
    if (conflictProcessing) return;
    setConflictOpen(false);
    setConflictStep("choose");
    setSubmitting(false);
  };

  const handleKindChange = (value: string) => {
    setSelectedKind(value);
    if (value !== "אחר") {
      setCustomKind("");
    }
  };

  return {
    area,
    setArea,
    street,
    setStreet,
    houseNumber,
    setHouseNumber,
    code,
    setCode,
    selectedKind,
    handleKindChange,
    customKind,
    setCustomKind,
    note,
    setNote,
    streetOptions,
    areaOptions,
    submitting,
    error,
    success,
    successMessage,
    existingMatches,
    conflictOpen,
    conflictStep,
    selectedSheetRowIndex,
    setSelectedSheetRowIndex,
    conflictProcessing,
    handleSubmit,
    handleChooseAddNew,
    handleChooseEdit,
    handleConfirmEdit,
    handleConflictClose,
    setConflictStep,
  };
}
