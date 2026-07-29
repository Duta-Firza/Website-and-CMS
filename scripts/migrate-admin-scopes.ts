/**
 * One-time migration: expand legacy group-level scope tokens into the per-submenu
 * leaf scopes RBAC now uses.
 *
 * Before, a user's `scopes` held section tokens like "inbox" or "about". Access
 * is now per submenu (see ADMIN_SCOPES in src/models/constants.ts), so any stored
 * group token would silently grant nothing. This expands each to the leaves it
 * used to cover, preserving intent, then drops anything unrecognised. Idempotent:
 * re-running is a no-op once every user holds only leaf scopes.
 *
 *   pnpm tsx scripts/migrate-admin-scopes.ts
 *
 * Required env: MONGODB_URI (from .env.local).
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import { ADMIN_SCOPES } from "../src/models/constants";
import { User } from "../src/models/user";

// Legacy section token -> the leaf scopes it used to imply.
const GROUP_TO_LEAVES: Record<string, string[]> = {
  analytics: ["visitorAnalytics"],
  home: ["landing"],
  about: ["about", "leadership", "history", "business", "credentials"],
  solutions: [
    "trading",
    "tradingPartners",
    "tradingProducts",
    "manufacturing",
    "epc",
    "technology",
  ],
  investorRelations: [
    "stocks",
    "reports",
    "publications",
    "pressRelease",
    "newsroom",
    "companyProfile",
  ],
  contact: ["contactInfo", "careers"],
  inbox: ["inquiries", "applications", "reportDownloads"],
};

const LEAVES = new Set<string>(ADMIN_SCOPES);

function migrate(scopes: string[]): string[] {
  const out = new Set<string>();
  for (const s of scopes) {
    // Group expansion takes priority over the leaf check: "about" is both an old
    // section token AND a new leaf. On a pre-upgrade DB the token means the
    // section, so expand it. (Transitional: run once during the upgrade, before
    // any leaf-scoped users exist — expanding an intentional lone "about" later
    // would wrongly re-add its siblings.)
    if (GROUP_TO_LEAVES[s]) for (const leaf of GROUP_TO_LEAVES[s]) out.add(leaf);
    else if (LEAVES.has(s)) out.add(s);
    // else: unknown token -> dropped
  }
  // Emit in canonical ADMIN_SCOPES order for stable, readable documents.
  return ADMIN_SCOPES.filter((s) => out.has(s));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  await mongoose.connect(uri);

  // `scopes` is not selected by default on lean reads elsewhere, but here we ask
  // for exactly what we need. Include soft-deleted users so their record stays
  // consistent too.
  const users = await User.find({})
    .select("email role scopes")
    .lean<{ _id: unknown; email?: string; role?: string; scopes?: string[] }[]>();

  let changed = 0;
  for (const u of users) {
    const current = u.scopes ?? [];
    const next = migrate(current);
    const same = current.length === next.length && current.every((s, i) => s === next[i]);
    if (same) continue;
    await User.updateOne({ _id: u._id }, { $set: { scopes: next } });
    changed++;
    console.log(`  ${u.email ?? u._id}: [${current.join(", ")}] -> [${next.join(", ")}]`);
  }

  console.log(changed === 0 ? "✓ Nothing to migrate." : `✓ Migrated ${changed} user(s).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
