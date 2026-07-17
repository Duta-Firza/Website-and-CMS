import { cookies } from "next/headers";
import { getCurrentAdmin } from "@/lib/cms/access";
import { getUnreadApplicationCount } from "@/lib/cms/applications";
import { getUnreadInquiryCount } from "@/lib/cms/inquiries";
import { canAccess } from "@/lib/rbac";
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_OPEN_GROUPS_COOKIE } from "./admin-sidebar-cookies";
import { AdminSidebarShell } from "./admin-sidebar-shell";

export async function AdminSidebar() {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "1";
  const openGroupCookie = cookieStore.get(SIDEBAR_OPEN_GROUPS_COOKIE)?.value;
  const initialOpenGroup = openGroupCookie?.split(",").filter(Boolean)[0] ?? null;

  // Role/scopes come from the DB, not the token — getCurrentAdmin is memoized
  // per request, so this shares one query with the layout and page.
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const showInbox = canAccess(admin, "inbox");
  const [initialUnreadCount, initialUnreadApplications] = await Promise.all([
    showInbox ? getUnreadInquiryCount().catch(() => 0) : 0,
    showInbox ? getUnreadApplicationCount().catch(() => 0) : 0,
  ]);

  return (
    <AdminSidebarShell
      initialCollapsed={collapsed}
      initialOpenGroup={initialOpenGroup}
      initialUnreadCount={initialUnreadCount}
      initialUnreadApplications={initialUnreadApplications}
      user={{ name: admin.name || admin.email || "—", email: admin.email, role: admin.role }}
      access={{ role: admin.role, scopes: admin.scopes }}
    />
  );
}
