"use client";

type Props = {
  kind: string;
  fallbackLabel: string | null;
  onKindSelect?: (kind: string) => void;
};

export function CodeKindBadge({ kind, fallbackLabel, onKindSelect }: Props) {
  if (kind) {
    return (
      <button
        type="button"
        onClick={() => onKindSelect?.(kind)}
        className="inline-flex rounded-lg border border-blue-200/70 bg-blue-50/80 px-2 py-0.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
      >
        {kind}
      </button>
    );
  }

  if (fallbackLabel) {
    return (
      <span className="inline-flex rounded-lg border border-amber-200/80 bg-amber-50/90 px-2 py-0.5 text-xs font-medium text-amber-800">
        {fallbackLabel}
      </span>
    );
  }

  return <span className="text-slate-400">-</span>;
}

