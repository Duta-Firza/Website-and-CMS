import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import authConfig from "@/auth.config";
import { User } from "@/models";
import { connectDB } from "./db";
import { env } from "./env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        // passwordHash is `select: false` on the schema, so it must be asked
        // for explicitly — without this every login fails.
        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
          isActive: true,
          isDeleted: { $ne: true },
        })
          .select("+passwordHash")
          .lean();
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Best-effort: a failed bookkeeping write shouldn't block a valid login.
        try {
          await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
        } catch (e) {
          console.error("[auth] lastLoginAt update failed", e);
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    // The token carries identity only — never `role` or `scopes`. Authorization
    // reads those from MongoDB on each request (src/lib/cms/access.ts) so a
    // deactivation or role change applies immediately rather than at token
    // expiry, and so there's only one source of truth for them.
    jwt: async ({ token, user }) => {
      if (user) token.uid = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string | undefined;
      }
      return session;
    },
  },
}));
