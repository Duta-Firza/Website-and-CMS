"use client";

import { BookText, Gauge, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Slim top bar for the /dev area. Hides itself on the login page. Rendered by
 * the (dev) layout so /devbooks and /devtools share nav + a logout control.
 */
export function DevChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (pathname === "/devlogin" || pathname.startsWith("/devlogin/")) return null;

  const links = [
    { href: "/devbooks", label: "Books", icon: BookText },
    { href: "/devtools", label: "Tools", icon: Gauge },
  ];

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/dev/logout", { method: "POST" });
    } finally {
      router.replace("/devlogin");
      router.refresh();
    }
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4">
        <span className="mr-3 text-sm font-semibold tracking-tight text-foreground">
          Dev<span className="text-muted-foreground">/</span>Console
        </span>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
        {mounted && (
          <button
            type="button"
            aria-label="Ganti tema"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="ml-auto flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={logout}
          disabled={loading}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-60",
            !mounted && "ml-auto",
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {loading ? "Keluar…" : "Keluar"}
        </button>
      </div>
    </header>
  );
}
