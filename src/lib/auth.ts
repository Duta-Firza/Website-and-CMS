import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "./env";

// NextAuth v5 supports a lazy config function — this defers env access until the
// handler is actually invoked, so `next build` does not require .env.local.
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (_credentials) => {
        // TODO Week 2: bcrypt compare + Mongo lookup
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
}));
