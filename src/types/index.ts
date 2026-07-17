import type { DefaultSession } from "next-auth";

// The session carries identity only. `role` and `scopes` are deliberately absent:
// they're read from MongoDB per request (src/lib/cms/access.ts), so a token can
// never hold a stale copy — and there's no role union here to drift from
// USER_ROLES in src/models/constants.ts.
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
  }
}

export type LocalizedString = {
  id: string;
  en: string;
};
