import {
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  ChartBar,
  Factory,
  Globe,
  Handshake,
  HardHat,
  type LucideIcon,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

/**
 * Shared icon registry used by admin pickers (Stats, Solution cards) and the
 * public renderers. Keep aligned with the whitelist arrays in
 * `models/constants.ts` so admins can't pick an icon that won't render.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  ChartBar,
  CalendarClock,
  Users,
  Briefcase,
  Award,
  Building2,
  Factory,
  Wrench,
  Globe,
  TrendingUp,
  Handshake,
  HardHat,
};

export function pickIcon(name: string, fallback: LucideIcon = ChartBar): LucideIcon {
  return ICON_MAP[name] ?? fallback;
}
