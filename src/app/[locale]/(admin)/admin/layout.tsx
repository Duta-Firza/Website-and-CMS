import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background px-4 pt-6 pb-8 has-data-sticky-form-bar:pb-0 md:px-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
