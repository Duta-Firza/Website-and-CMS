import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Award,
  Briefcase,
  Building2,
  Clock,
  Factory,
  FileBarChart,
  FileText,
  Handshake,
  HardHat,
  Home,
  Inbox,
  Info,
  Layers,
  LayoutDashboard,
  LineChart,
  Mail,
  MailQuestion,
  Megaphone,
  Network,
  Newspaper,
  Package,
  Settings,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export interface AdminNavGroup {
  key: string;
  titleKey: string;
  icon: LucideIcon;
  items: AdminNavItem[];
}

export interface AdminNavData {
  /** Top-level (no group) entry: Dashboard */
  top: AdminNavItem;
  groups: AdminNavGroup[];
}

export function buildAdminNav(locale: string): AdminNavData {
  const base = `/${locale}/admin`;
  return {
    top: { labelKey: "dashboard", href: base, icon: LayoutDashboard },
    groups: [
      {
        key: "home",
        titleKey: "groupHome",
        icon: Home,
        items: [{ labelKey: "landing", href: `${base}/landing`, icon: Sparkles }],
      },
      {
        key: "about",
        titleKey: "groupAbout",
        icon: Info,
        items: [
          { labelKey: "about", href: `${base}/about`, icon: FileText },
          { labelKey: "leadership", href: `${base}/about/leadership`, icon: Users },
          { labelKey: "history", href: `${base}/about/history`, icon: Clock },
          { labelKey: "business", href: `${base}/about/business`, icon: Network },
          { labelKey: "credentials", href: `${base}/about/credentials`, icon: Award },
        ],
      },
      {
        key: "solutions",
        titleKey: "groupSolutions",
        icon: Layers,
        items: [
          {
            labelKey: "trading",
            href: `${base}/solutions/trading`,
            icon: ArrowRightLeft,
          },
          {
            labelKey: "tradingPartners",
            href: `${base}/solutions/trading/partners`,
            icon: Handshake,
          },
          {
            labelKey: "tradingProducts",
            href: `${base}/solutions/trading/products`,
            icon: Package,
          },
          {
            labelKey: "manufacturing",
            href: `${base}/solutions/manufacturing`,
            icon: Factory,
          },
          {
            labelKey: "epc",
            href: `${base}/solutions/epc`,
            icon: HardHat,
          },
        ],
      },
      {
        key: "investorRelations",
        titleKey: "groupInvestorRelations",
        icon: LineChart,
        items: [
          {
            labelKey: "stocks",
            href: `${base}/investor-relations/stocks`,
            icon: TrendingUp,
          },
          {
            labelKey: "reports",
            href: `${base}/investor-relations/reports`,
            icon: FileBarChart,
          },
          {
            labelKey: "publications",
            href: `${base}/investor-relations/publications`,
            icon: FileText,
          },
          {
            labelKey: "pressRelease",
            href: `${base}/investor-relations/press-release`,
            icon: Megaphone,
          },
          {
            labelKey: "newsroom",
            href: `${base}/investor-relations/newsroom`,
            icon: Newspaper,
          },
          {
            labelKey: "companyProfile",
            href: `${base}/investor-relations/company-profile`,
            icon: Building2,
          },
        ],
      },
      {
        key: "contact",
        titleKey: "groupContact",
        icon: Mail,
        items: [
          { labelKey: "contactInfo", href: `${base}/contact`, icon: Mail, comingSoon: true },
          {
            labelKey: "careers",
            href: `${base}/contact/careers`,
            icon: Briefcase,
            comingSoon: true,
          },
        ],
      },
      {
        key: "inbox",
        titleKey: "groupInbox",
        icon: Inbox,
        items: [{ labelKey: "inquiries", href: `${base}/inquiries`, icon: MailQuestion }],
      },
      {
        key: "system",
        titleKey: "groupSystem",
        icon: Settings,
        items: [
          { labelKey: "settings", href: `${base}/settings`, icon: Settings },
          { labelKey: "users", href: `${base}/users`, icon: UserCog, comingSoon: true },
        ],
      },
    ],
  };
}
