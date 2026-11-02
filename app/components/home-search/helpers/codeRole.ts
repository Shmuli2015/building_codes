export type CodeRoleInfo = {
  badgeLabel: string;
  isAlternative: boolean;
};

export function getCodeRoleInfo(
  index: number,
  totalMatches: number,
): CodeRoleInfo | null {
  if (totalMatches <= 1) {
    return null;
  }
  if (index === 0) {
    return {
      badgeLabel: "קוד 1",
      isAlternative: false,
    };
  }
  if (index === 1) {
    return {
      badgeLabel: "קוד חלופי",
      isAlternative: true,
    };
  }
  return {
    badgeLabel: `קוד ${index + 1}`,
    isAlternative: true,
  };
}

