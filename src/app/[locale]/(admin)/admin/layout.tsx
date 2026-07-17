import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCurrentAdmin } from "@/lib/cms/access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Catches sessions revoked mid-flight (deactivated or deleted user). This is
  // a safety net, not the authorization boundary: soft navigation reuses a
  // layout without re-running it, so each page guards its own scope.
  const [admin, locale] = await Promise.all([getCurrentAdmin(), getLocale()]);
  if (!admin) redirect(`/${locale}/admin/login?reason=revoked`);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background px-4 pt-6 pb-8 has-data-sticky-form-bar:pb-0 md:px-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
