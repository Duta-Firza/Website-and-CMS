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
  // 8h rather than NextAuth's 30-day default. Authorization is re-read from the
  // DB per request, so this is only a backstop bounding how long a stolen or
  // forgotten cookie stays usable.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
} satisfies NextAuthConfig;
