import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — no Mongoose, no bcrypt, no Node-only deps.
 * Used by the proxy.ts middleware which runs in the Edge runtime.
 * The full config (with Credentials provider that hits MongoDB) lives in
 * src/lib/auth.ts and extends this base.
 */
export default {
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
