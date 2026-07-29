import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requirePageScope } from "@/lib/cms/access";
import { loadAdminUsers } from "@/lib/cms/admin-users";
import { parseAdminListParams } from "@/lib/cms/list-params";
import { UsersManager } from "./users-manager";

export type { UserRow } from "@/lib/cms/admin-users";

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The "system" scope resolves to super-admin only. Uses requirePageScope, not
  // requireSuperAdmin: the latter throws (right for actions), while a page must
  // redirect — otherwise an editor gets a 500 instead of being sent home.
  const me = await requirePageScope("system");

  const [sp, t] = await Promise.all([searchParams, getTranslations("Admin.pages.users")]);
  const params = parseAdminListParams(sp, "nameAsc");
  const { items, total } = await loadAdminUsers(params);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <UsersManager items={items} total={total} currentUserId={me.id} />
    </div>
  );
}
