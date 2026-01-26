import { TeamMember } from "@omenai/shared-types";
import {
  CircleDollarSign,
  Cog,
  Landmark,
  Newspaper,
  Palette,
  Proportions,
  UserRoundPen,
  ChartColumnBig,
  Headset,
} from "lucide-react";
// types/sidebar.ts
import { LucideIcon } from "lucide-react";
export type SidebarSection = "actions" | "management" | "activity" | "account";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: SidebarSection;
  key: KeyList;
};

import { KeyList } from "../utils/canAccessRoute";

export const sidebarItems: SidebarItem[] = [
  {
    label: "Gallery requests",
    icon: Landmark,
    href: "/admin/requests/gallery",
    section: "actions",
    key: "requests",
  },
  {
    label: "Artist requests",
    icon: Palette,
    href: "/admin/requests/artist",
    section: "actions",
    key: "requests",
  },
  {
    label: "Support tickets",
    icon: Headset,
    href: "/admin/support",
    section: "actions",
    key: "support",
  },

  {
    label: "Upload promotionals",
    icon: Proportions,
    href: "/admin/promotionals",
    section: "activity",
    key: "promotionals",
  },
  {
    label: "Upload editorials",
    icon: Newspaper,
    href: "/admin/editorials",
    section: "activity",
    key: "editorials",
  },
  {
    label: "Revenue and tax activity",
    icon: CircleDollarSign,
    href: "/admin/taxes",
    section: "activity",
    key: "taxes",
  },
  {
    label: "Team members",
    icon: UserRoundPen,
    href: "/admin/members",
    section: "management",
    key: "team",
  },
  {
    label: "Mission Control",
    icon: ChartColumnBig,
    href: "/admin/analytics",
    section: "management",
    key: "analytics",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
    section: "account",
    key: "settings",
  },
];
