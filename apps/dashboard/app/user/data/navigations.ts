// types/sidebar.ts
import { LucideIcon } from "lucide-react";

export type SidebarSection = "core" | "account";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: SidebarSection;
};

// config/sidebar.ts
import { Package, Image, User, Settings, Headphones } from "lucide-react";

export const sidebarItems: SidebarItem[] = [
  {
    label: "Saved Artworks",
    href: "/user/saves",
    icon: Image,
    section: "core",
  },
  {
    label: "Orders",
    href: "/user/orders",
    icon: Package,
    section: "core",
  },

  {
    label: "Profile",
    href: "/user/profile",
    icon: User,
    section: "account",
  },
  {
    label: "Support tickets",
    href: "/user/support",
    icon: Headphones,
    section: "account",
  },
  {
    label: "Settings",
    href: "/user/settings",
    icon: Settings,
    section: "account",
  },
];
