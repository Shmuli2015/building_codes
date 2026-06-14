const rtf = new Intl.RelativeTimeFormat("he", { numeric: "auto" });

export function formatRelativeTimeHe(
  input: string | Date,
  nowMs: number = Date.now(),
): string {
  const t = typeof input === "string" ? new Date(input) : input;
  const ts = t.getTime();
  if (!Number.isFinite(ts)) return "";

  const diffSec = (ts - nowMs) / 1000;
  if (Math.abs(diffSec) < 8) return "עכשיו";

  if (Math.abs(diffSec) < 60) {
    return rtf.format(Math.round(diffSec), "second");
  }
  if (Math.abs(diffSec) < 3600) {
    return rtf.format(Math.round(diffSec / 60), "minute");
  }
  if (Math.abs(diffSec) < 86400) {
    return rtf.format(Math.round(diffSec / 3600), "hour");
  }
  if (Math.abs(diffSec) < 86400 * 60) {
    return rtf.format(Math.round(diffSec / 86400), "day");
  }
  if (Math.abs(diffSec) < 86400 * 365) {
    return rtf.format(Math.round(diffSec / (86400 * 30)), "month");
  }
  return rtf.format(Math.round(diffSec / (86400 * 365)), "year");
}
