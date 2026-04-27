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
  Image,
  MessageCircleMore,
  Truck,
  ChartColumn,
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
    label: "Collector roster",
    icon: MessageCircleMore,
    href: "/admin/collectors",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Gallery requests",
    icon: Landmark,
    href: "/admin/requests/gallery",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Artist requests",
    icon: Palette,
    href: "/admin/requests/artist",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Curation",
    icon: Palette,
    href: "/admin/curation",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Support tickets",
    icon: Headset,
    href: "/admin/support",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Review Hub",
    icon: MessageCircleMore,
    href: "/admin/reviews",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Shipments",
    icon: Truck,
    href: "/admin/shipments",
    section: "actions",
    key: "admin_access",
  },

  {
    label: "Artworks",
    icon: Image,
    href: "/admin/artworks",
    section: "actions",
    key: "management_access",
  },
  {
    label: "Upload promotionals",
    icon: Proportions,
    href: "/admin/promotionals",
    section: "activity",
    key: "management_access",
  },
  {
    label: "Upload editorials",
    icon: Newspaper,
    href: "/admin/editorials",
    section: "activity",
    key: "management_access",
  },
  {
    label: "Revenue and tax activity",
    icon: CircleDollarSign,
    href: "/admin/taxes",
    section: "activity",
    key: "owner_access",
  },
  {
    label: "Team members",
    icon: UserRoundPen,
    href: "/admin/members",
    section: "management",
    key: "admin_access",
  },
  {
    label: "Mission Control",
    icon: ChartColumnBig,
    href: "/admin/waitlist_analytics",
    section: "management",
    key: "admin_access",
  },
  {
    label: "Analytics",
    icon: ChartColumn,
    href: "/admin/analytics",
    section: "management",
    key: "admin_access",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
    section: "account",
    key: "low_level_access",
  },
];
