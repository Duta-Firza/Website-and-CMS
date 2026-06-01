import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "super-admin" | "editor" | "viewer";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "super-admin" | "editor" | "viewer";
  }
}

export type LocalizedString = {
  id: string;
  en: string;
};
