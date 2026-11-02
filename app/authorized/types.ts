import type { AuthorizedUser } from "@/lib/auth-types";

export type { AuthorizedUser };

export type AuthorizedPageViewProps = {
  currentUserEmail: string | null;
  addAuthorizedEnabled: boolean;
};

