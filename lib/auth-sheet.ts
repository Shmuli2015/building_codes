import type { AuthorizedUser } from "./auth-types";

export type { AuthorizedUser };

export type AuthColumnLayout = {
  emailCol: number;
  nameCol: number;
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function resolveAuthColumns(header: string[]): AuthColumnLayout {
  let emailCol = -1;
  let nameCol = -1;

  header.forEach((cell, index) => {
    const normalized = cell.trim().toLowerCase().replace(/\s+/g, " ");

    if (
      emailCol < 0 &&
      (normalized.includes("אימייל") ||
        normalized.includes("מייל") ||
        normalized.includes("email") ||
        normalized === "mail")
    ) {
      emailCol = index;
    }

    if (
      nameCol < 0 &&
      !normalized.includes("אימייל") &&
      !normalized.includes("מייל") &&
      !normalized.includes("email") &&
      (normalized.includes("שם") || normalized.includes("name"))
    ) {
      nameCol = index;
    }
  });

  if (emailCol < 0) emailCol = 0;
  if (nameCol < 0) nameCol = 1;

  return { emailCol, nameCol };
}

export function buildAuthSheetRow(
  email: string,
  name: string,
  layout: AuthColumnLayout,
): string[] {
  const maxCol = Math.max(layout.emailCol, layout.nameCol);
  const row = Array.from({ length: maxCol + 1 }, () => "");
  row[layout.emailCol] = email;
  row[layout.nameCol] = name;
  return row;
}

export function getEmailFromAuthRow(
  row: string[],
  layout: AuthColumnLayout,
): string {
  return String(row[layout.emailCol] ?? "").trim().toLowerCase();
}

export function normalizeAuthSheetRow(
  row: string[],
  layout: AuthColumnLayout,
): string[] {
  return buildAuthSheetRow(
    getEmailFromAuthRow(row, layout),
    String(row[layout.nameCol] ?? "").trim(),
    layout,
  );
}

export function parseAuthorizedSheetRows(
  values: string[][] | null | undefined,
): AuthorizedUser[] {
  if (!values?.length) return [];

  const header = values[0].map((cell) => String(cell).trim());
  const layout = resolveAuthColumns(header);

  return values
    .slice(1)
    .map((row) => ({
      email: getEmailFromAuthRow(row, layout),
      name: String(row[layout.nameCol] ?? "").trim(),
    }))
    .filter((user) => user.email && isValidEmail(user.email));
}
