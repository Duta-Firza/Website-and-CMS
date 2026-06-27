/**
 * One-off migration: decouple inquiry read-state from workflow status.
 *
 *   pnpm tsx scripts/migrate-inquiries.ts
 *
 * Old docs used a combined status enum (new/read/archived) and had no `read`
 * field. This:
 *   - sets `read: true`  on docs whose old status was "read" or "archived"
 *     (and "read" docs become workflow status "new" again),
 *   - sets `read: false` on any remaining docs missing the field,
 *   - remaps the legacy "read" status to the new "new" workflow status.
 *
 * Idempotent — safe to run multiple times. No-op once the data is normalized.
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import { Inquiry } from "../src/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI not set");
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

  // Mark read for legacy "read"/"archived" docs that don't yet have the flag.
  const readByStatus = await Inquiry.updateMany(
    { read: { $exists: false }, status: { $in: ["read", "archived"] } },
    { $set: { read: true } },
  );
  // Everything else missing the flag is unread.
  const unreadRest = await Inquiry.updateMany(
    { read: { $exists: false } },
    { $set: { read: false } },
  );
  // Legacy "read" status is no longer a workflow value → back to "new".
  const remapStatus = await Inquiry.updateMany({ status: "read" }, { $set: { status: "new" } });

  console.log(`✓ read=true (legacy read/archived): ${readByStatus.modifiedCount}`);
  console.log(`✓ read=false (remaining):           ${unreadRest.modifiedCount}`);
  console.log(`✓ status "read" → "new":            ${remapStatus.modifiedCount}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
