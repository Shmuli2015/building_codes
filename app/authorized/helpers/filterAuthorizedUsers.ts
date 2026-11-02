import type { AuthorizedUser } from "../types";

export function filterAuthorizedUsers(
  users: AuthorizedUser[],
  rawQuery: string,
): AuthorizedUser[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return users;
  }

  return users.filter((user) => {
    const matchName = user.name?.toLowerCase().includes(query) ?? false;
    const matchEmail = user.email.toLowerCase().includes(query);
    return matchName || matchEmail;
  });
}

