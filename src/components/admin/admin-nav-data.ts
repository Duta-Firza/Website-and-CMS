import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Award,
  Briefcase,
  Building2,
  Clock,
  Cpu,
  Download,
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
// Client-safe: @/models/constants holds pure constants. Importing from
// @/models instead would drag Mongoose into the browser bundle.
import { type AdminAccess, canAccess, type NavScope } from "@/lib/rbac";

export interface AdminNavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  /** Marks the item that displays a live unread-count badge. */
  badge?: "unreadInquiries" | "unreadApplications";
  /** Overrides the group's scope for this item alone. */
  scope?: NavScope;
}

export interface AdminNavGroup {
  key: string;
  titleKey: string;
  icon: LucideIcon;
  /**
   * Permission required to see this group. `null` means always visible.
   * Kept separate from `key`, which is already the sidebar's open/collapse
   * cookie value — tying authz to it would mean renaming a scope silently
   * invalidates everyone's saved sidebar state.
   */
  scope: NavScope | null;
  items: AdminNavItem[];
}

/** Functional grouping (Analytics, Content, Inbox, System) above the groups. */
export interface AdminNavSection {
  key: string;
  titleKey: string;
  groups: AdminNavGroup[];
}

export interface AdminNavData {
  sections: AdminNavSection[];
}

/**
 * Builds the admin nav, optionally filtered to what `access` may reach. Omit
 * `access` only where the caller has already authorized (or is a pure layout
 * measurement) — the sidebar and dashboard must always pass it, or they'd
 * advertise pages the user gets bounced from.
 */
export function buildAdminNav(locale: string, access?: AdminAccess): AdminNavData {
  const base = `/${locale}/admin`;
  const nav = buildFullNav(base);
  if (!access) return nav;

  const sections = nav.sections
    .map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccess(access, item.scope ?? group.scope)),
        }))
        .filter((group) => group.items.length > 0),
    }))
    .filter((section) => section.groups.length > 0);

  return { sections };
}

function buildFullNav(base: string): AdminNavData {
  return {
    sections: [
      {
        key: "analytics",
        titleKey: "sectionAnalytics",
        groups: [
          {
            // Ungated: every admin needs a landing page, otherwise /admin
            // denies -> login -> back to /admin. Visitor Analytics is real
            // business data, so it opts into a scope on its own.
            key: "dashboard",
            titleKey: "dashboard",
            icon: LayoutDashboard,
            scope: null,
            items: [
              { labelKey: "dashboard", href: base, icon: LayoutDashboard },
              {
                labelKey: "visitorAnalytics",
                href: `${base}/visitor-analytics`,
                icon: LineChart,
                scope: "analytics",
              },
            ],
          },
        ],
      },
      {
        key: "content",
        titleKey: "sectionContent",
        groups: [
          {
            key: "home",
            titleKey: "groupHome",
            icon: Home,
            scope: "home",
            items: [{ labelKey: "landing", href: `${base}/landing`, icon: Sparkles }],
          },
          {
            key: "about",
            titleKey: "groupAbout",
            icon: Info,
            scope: "about",
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
            scope: "solutions",
            items: [
              { labelKey: "trading", href: `${base}/solutions/trading`, icon: ArrowRightLeft },
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
              { labelKey: "manufacturing", href: `${base}/solutions/manufacturing`, icon: Factory },
              { labelKey: "epc", href: `${base}/solutions/epc`, icon: HardHat },
              { labelKey: "technology", href: `${base}/solutions/technology`, icon: Cpu },
            ],
          },
          {
            key: "investorRelations",
            titleKey: "groupInvestorRelations",
            icon: LineChart,
            scope: "investorRelations",
            items: [
              { labelKey: "stocks", href: `${base}/investor-relations/stocks`, icon: TrendingUp },
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
            titleKey: "groupConnect",
            icon: Mail,
            scope: "contact",
            items: [
              { labelKey: "contactInfo", href: `${base}/contact`, icon: Mail },
              {
                labelKey: "careers",
                href: `${base}/contact/careers`,
                icon: Briefcase,
              },
            ],
          },
        ],
      },
      {
        key: "inbox",
        titleKey: "sectionInbox",
        groups: [
          {
            key: "inbox",
            titleKey: "groupInbox",
            icon: Inbox,
            scope: "inbox",
            items: [
              {
                labelKey: "inquiries",
                href: `${base}/inquiries`,
                icon: MailQuestion,
                badge: "unreadInquiries",
              },
              {
                labelKey: "applications",
                href: `${base}/applications`,
                icon: Briefcase,
                badge: "unreadApplications",
              },
              {
                labelKey: "reportDownloads",
                href: `${base}/report-downloads`,
                icon: Download,
              },
            ],
          },
        ],
      },
      {
        key: "system",
        titleKey: "sectionSystem",
        groups: [
          {
            key: "system",
            titleKey: "groupSystem",
            icon: Settings,
            scope: "system",
            items: [{ labelKey: "users", href: `${base}/users`, icon: UserCog }],
          },
        ],
      },
    ],
  };
}
