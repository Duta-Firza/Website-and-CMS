import { ThemeToggle } from "@/components/layout/theme-toggle";
import { auth } from "@/lib/auth";
import { AdminUserMenu } from "./admin-user-menu";

export async function AdminTopbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex h-14 items-center justify-end gap-2 border-b bg-card px-4">
      <ThemeToggle />
      {user && (
        <AdminUserMenu
          name={user.name ?? user.email ?? "—"}
          email={user.email ?? ""}
          role={user.role}
        />
      )}
    </header>
  );
}
