import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  Building2,
  Clock,
  FileText,
  Handshake,
  Info,
  LayoutDashboard,
  Network,
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
      titleKey: "aboutPage",
      items: [
        { labelKey: "about", href: `${base}/about`, icon: Info },
        { labelKey: "leadership", href: `${base}/leadership`, icon: Users },
        { labelKey: "history", href: `${base}/history`, icon: Clock },
        { labelKey: "business", href: `${base}/business`, icon: Network },
        { labelKey: "credentials", href: `${base}/credentials`, icon: Award },
      ],
    },
    {
      titleKey: "content",
      items: [
        { labelKey: "partners", href: `${base}/partners`, icon: Handshake },
        { labelKey: "projects", href: `${base}/projects`, icon: Briefcase },
        { labelKey: "customers", href: `${base}/customers`, icon: Building2 },
        { labelKey: "solutions", href: `${base}/solutions`, icon: FileText },
        { labelKey: "newsroom", href: `${base}/newsroom`, icon: Newspaper },
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
