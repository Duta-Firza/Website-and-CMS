import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().email(),
  INQUIRY_TO_EMAIL: z.string().email(),
  CONTACT_TO_EMAIL: z.string().email(),
  // Optional dedicated recipient for job applications; falls back to INQUIRY_TO_EMAIL.
  APPLICATIONS_TO_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  // Umami analytics. Declared here for documentation only — these are read via
  // direct `process.env` access in src/lib/umami.ts (Next only inlines
  // NEXT_PUBLIC_* at build time through member access, and this `env` proxy is
  // server-only). All three stay optional so an unconfigured deploy keeps
  // working with tracking simply switched off.
  // `""` is accepted alongside a real URL because .env.example ships these keys
  // empty to disable tracking — a bare .url() would reject that and take the
  // whole proxy (and with it db/auth/email) down.
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  NEXT_PUBLIC_UMAMI_SHARE_URL: z.union([z.string().url(), z.literal("")]).optional(),
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.union([z.string().url(), z.literal("")]).optional(),
  // Dev area (/devbooks + /devtools). Read via direct `process.env` in
  // src/lib/devtools/dev-auth.ts (must stay edge-safe for proxy.ts), so these
  // are declared here for documentation/validation only. All optional so an
  // unconfigured deploy still builds; when password/token are unset the gate
  // simply denies every login attempt.
  DEVTOOLS_PASSWORD: z.string().optional(),
  DEVTOOLS_COLLECT_TOKEN: z.string().optional(),
  DEVTOOLS_SESSION_HOURS: z.string().optional(),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

function load(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables:\n",
      JSON.stringify(z.treeifyError(parsed.error), null, 2),
    );
    throw new Error(
      "Invalid environment variables. Copy .env.example to .env.local and fill in values.",
    );
  }
  cached = parsed.data;
  return cached;
}

/**
 * Lazily-validated environment variables.
 *
 * Validation runs the first time a property is read, not at module load. This lets
 * `next build` succeed even when .env.local is incomplete, while runtime access still
 * fails fast with a clear Zod-based error message.
 */
export const env = new Proxy({} as Env, {
  get(_target, prop) {
    return load()[prop as keyof Env];
  },
  has(_target, prop) {
    return prop in load();
  },
});
