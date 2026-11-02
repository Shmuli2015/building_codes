"use client";

type Props = {
  addressText: string;
  count: number;
};

export function ResultAddressBanner({ addressText, count }: Props) {
  return (
    <div className="mb-4 rounded-2xl border border-blue-100/90 bg-linear-to-b from-blue-50/70 via-white to-indigo-50/30 p-4 ring-1 ring-blue-500/10">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold text-slate-900 sm:text-lg">
          {addressText}
        </p>
        <span className="inline-flex shrink-0 items-center rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
          נמצאו {count} קודים
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500">
        מומלץ לנסות את הקוד הראשון, ובמידת הצורך את הקוד החלופי
      </p>
    </div>
  );
}

