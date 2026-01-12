// types/sidebar.ts
import { LucideIcon } from "lucide-react";

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
  LogOut,
} from "lucide-react";

export const sidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    href: "/artist/app/overview",
    icon: LayoutDashboard,
    section: "core",
  },
  {
    label: "Orders",
    href: "/artist/app/orders",
    icon: Package,
    section: "core",
  },
  {
    label: "My Artworks",
    href: "/artist/app/artworks",
    icon: Image,
    section: "core",
  },

  {
    label: "Wallet",
    href: "/artist/app/wallet",
    icon: Wallet,
    section: "finance",
  },

  {
    label: "Account Management",
    href: "/artist/app/account",
    icon: User,
    section: "account",
  },
];
