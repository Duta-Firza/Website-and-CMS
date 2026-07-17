import { connectDB } from "@/lib/db";
import { User } from "@/models";
import type { AdminScope, UserRole } from "@/models/constants";
import type { AdminListParams } from "./list-params";
import { escapeRegex } from "./list-query";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  scopes: AdminScope[];
  isActive: boolean;
  /** ISO, or null when the user has never signed in. */
  lastLoginAt: string | null;
  createdAt: string;
}

/**
 * Soft-deleted users are excluded everywhere. `$ne: true` rather than `false`:
 * accounts created before `isDeleted` existed have no such field, and `false`
 * would match none of them.
 */
const NOT_DELETED = { isDeleted: { $ne: true } } as const;

function sortFor(sort: string): Record<string, 1 | -1> {
  switch (sort) {
    case "nameDesc":
      return { name: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "newest":
      return { createdAt: -1 };
    case "lastLogin":
      return { lastLoginAt: -1 };
    default:
      return { name: 1 };
  }
}

export async function loadAdminUsers(
  params: AdminListParams,
): Promise<{ items: UserRow[]; total: number }> {
  await connectDB();

  const filter: Record<string, unknown> = { ...NOT_DELETED };
  if (params.filter !== "all") filter.role = params.filter;
  if (params.status === "active") filter.isActive = { $ne: false };
  else if (params.status === "inactive") filter.isActive = false;
  if (params.q) {
    const rx = new RegExp(escapeRegex(params.q), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const total = await User.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
  const page = Math.min(params.page, pageCount);

  const sortByName = params.sort === "nameAsc" || params.sort === "nameDesc";
  let query = User.find(filter)
    // passwordHash is `select: false`, but be explicit about what crosses to the client.
    .select("name email role scopes isActive lastLoginAt createdAt")
    .sort(sortFor(params.sort))
    .skip((page - 1) * params.pageSize)
    .limit(params.pageSize);
  if (sortByName) query = query.collation({ locale: "en", strength: 2 });

  const docs =
    await query.lean<
      {
        _id: unknown;
        name?: string;
        email?: string;
        role?: UserRole;
        scopes?: AdminScope[];
        isActive?: boolean;
        lastLoginAt?: Date;
        createdAt: Date;
      }[]
    >();

  const items: UserRow[] = docs.map((d) => ({
    id: String(d._id),
    name: d.name ?? "",
    email: d.email ?? "",
    role: d.role ?? "editor",
    scopes: d.scopes ?? [],
    isActive: d.isActive !== false,
    lastLoginAt: d.lastLoginAt ? d.lastLoginAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

  return { items, total };
}

/**
 * Counts active super-admins other than `excludeId`. Guards against demoting,
 * deactivating or deleting the last one and locking everybody out.
 */
export async function countOtherActiveSuperAdmins(excludeId: string): Promise<number> {
  await connectDB();
  return User.countDocuments({
    ...NOT_DELETED,
    role: "super-admin",
    isActive: true,
    _id: { $ne: excludeId },
  });
}

export { NOT_DELETED };
