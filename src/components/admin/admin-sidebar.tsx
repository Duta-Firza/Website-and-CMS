import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getUnreadApplicationCount } from "@/lib/cms/applications";
import { getUnreadInquiryCount } from "@/lib/cms/inquiries";
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_OPEN_GROUPS_COOKIE } from "./admin-sidebar-cookies";
import { AdminSidebarShell } from "./admin-sidebar-shell";

export async function AdminSidebar() {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "1";
  const openGroupCookie = cookieStore.get(SIDEBAR_OPEN_GROUPS_COOKIE)?.value;
  const initialOpenGroup = openGroupCookie?.split(",").filter(Boolean)[0] ?? null;

  const [session, initialUnreadCount, initialUnreadApplications] = await Promise.all([
    auth(),
    getUnreadInquiryCount().catch(() => 0),
    getUnreadApplicationCount().catch(() => 0),
  ]);
  const u = session?.user;
  const user = u
    ? {
        name: u.name ?? u.email ?? "—",
        email: u.email ?? "",
        role: u.role,
      }
    : null;

  return (
    <AdminSidebarShell
      initialCollapsed={collapsed}
      initialOpenGroup={initialOpenGroup}
      initialUnreadCount={initialUnreadCount}
      initialUnreadApplications={initialUnreadApplications}
      user={user}
    />
  );
}
