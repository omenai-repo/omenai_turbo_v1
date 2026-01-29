import { Headphones, LucideIcon } from "lucide-react";

export type SidebarSection = "core" | "finance" | "account";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: SidebarSection;
};

// config/sidebar.ts
import {
  LayoutDashboard,
  Package,
  Image,
  CreditCard,
  Wallet,
  User,
  Settings,
} from "lucide-react";

export const sidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    href: "/gallery/overview",
    icon: LayoutDashboard,
    section: "core",
  },
  {
    label: "Orders",
    href: "/gallery/orders",
    icon: Package,
    section: "core",
  },
  {
    label: "My Artworks",
    href: "/gallery/artworks",
    icon: Image,
    section: "core",
  },

  {
    label: "Subscription & Billing",
    href: "/gallery/billing",
    icon: CreditCard,
    section: "finance",
  },
  {
    label: "Payouts",
    href: "/gallery/payouts",
    icon: Wallet,
    section: "finance",
  },

  {
    label: "Profile",
    href: "/gallery/profile",
    icon: User,
    section: "account",
  },
  {
    label: "Support tickets",
    href: "/gallery/support",
    icon: Headphones,
    section: "account",
  },
  {
    label: "Settings",
    href: "/gallery/settings",
    icon: Settings,
    section: "account",
  },
];
