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
  Wallet,
  User,
  MessageCircleMore,
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
    label: "Review Hub",
    href: "/artist/app/reviews",
    icon: MessageCircleMore,
    section: "core",
  },

  {
    label: "Wallet",
    href: "/artist/app/wallet",
    icon: Wallet,
    section: "finance",
  },
  {
    label: "Support tickets",
    href: "/artist/app/support",
    icon: Headphones,
    section: "account",
  },

  {
    label: "Account Management",
    href: "/artist/app/account",
    icon: User,
    section: "account",
  },
];
