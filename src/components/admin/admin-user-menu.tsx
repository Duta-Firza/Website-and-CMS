"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  email: string;
  role?: string;
  compact?: boolean;
}

export function AdminUserMenu({ name, email, role, compact = false }: Props) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={compact ? name : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: compact ? "icon" : "sm" }),
          !compact && "gap-2 px-2",
        )}
      >
        <Avatar className={compact ? "h-7 w-7" : "h-6 w-6"}>
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        {!compact && <span className="hidden max-w-32 truncate text-sm sm:inline">{name}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
            {role && (
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{role}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
