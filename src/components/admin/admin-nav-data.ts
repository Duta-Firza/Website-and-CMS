import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  Building2,
  FileText,
  Handshake,
  LayoutDashboard,
  Newspaper,
  Settings,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  titleKey: string;
  items: AdminNavItem[];
}

export function buildAdminNav(locale: string): AdminNavSection[] {
  const base = `/${locale}/admin`;
  return [
    {
      titleKey: "overview",
      items: [{ labelKey: "dashboard", href: base, icon: LayoutDashboard }],
    },
    {
      titleKey: "landingPage",
      items: [{ labelKey: "landing", href: `${base}/landing`, icon: Sparkles }],
    },
    {
      titleKey: "content",
      items: [
        { labelKey: "partners", href: `${base}/partners`, icon: Handshake },
        { labelKey: "projects", href: `${base}/projects`, icon: Briefcase },
        { labelKey: "customers", href: `${base}/customers`, icon: Building2 },
        { labelKey: "solutions", href: `${base}/solutions`, icon: FileText },
        { labelKey: "newsroom", href: `${base}/newsroom`, icon: Newspaper },
        { labelKey: "leadership", href: `${base}/leadership`, icon: Users },
        { labelKey: "credentials", href: `${base}/credentials`, icon: Award },
      ],
    },
    {
      titleKey: "system",
      items: [
        { labelKey: "settings", href: `${base}/settings`, icon: Settings },
        { labelKey: "users", href: `${base}/users`, icon: UserCog },
      ],
    },
  ];
}
