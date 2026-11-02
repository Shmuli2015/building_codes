"use client";

import { useMemo } from "react";
import type { CodeWithIndex } from "@/lib/sheet-actions";
import { groupCodesByAddress } from "../helpers/groupCodes";
import { CodesTableDesktop } from "./CodesTableDesktop";
import { CodesTableMobile } from "./CodesTableMobile";

type Props = {
  rows: CodeWithIndex[];
  copiedKey: string | null;
  copyFailedKey: string | null;
  onCopy: (code: string, rowKey: string) => void;
  onAreaSelect?: (area: string) => void;
  onKindSelect?: (kind: string) => void;
  onEdit: (row: CodeWithIndex) => void;
  onDelete: (row: CodeWithIndex) => void;
};

export function CodesTableView({
  rows,
  copiedKey,
  copyFailedKey,
  onCopy,
  onAreaSelect,
  onKindSelect,
  onEdit,
  onDelete,
}: Props) {
  const groups = useMemo(() => groupCodesByAddress(rows), [rows]);

  return (
    <div className="flex flex-col gap-3">
      <CodesTableDesktop
        groups={groups}
        copiedKey={copiedKey}
        copyFailedKey={copyFailedKey}
        onCopy={onCopy}
        onAreaSelect={onAreaSelect}
        onKindSelect={onKindSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CodesTableMobile
        groups={groups}
        copiedKey={copiedKey}
        copyFailedKey={copyFailedKey}
        onCopy={onCopy}
        onAreaSelect={onAreaSelect}
        onKindSelect={onKindSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
