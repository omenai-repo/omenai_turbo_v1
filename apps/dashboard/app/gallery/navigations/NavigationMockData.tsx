export type SidebarSection =
  | "general"
  | "inventory"
  | "programming"
  | "operations"
  | "configuration";

export type SidebarItem = {
  label: string;
  href: string;
  section: SidebarSection;
};

export const sidebarItems: SidebarItem[] = [
  // General
  { label: "Overview", href: "/gallery/overview", section: "general" },

  // Inventory
  { label: "Artworks", href: "/gallery/artworks", section: "inventory" },
  { label: "Artist Roster", href: "/gallery/roster", section: "inventory" },

  // Programming (Pre-populating for what we will build next)
  {
    label: "Shows, Fairs and Events",
    href: "/gallery/programming",
    section: "programming",
  },
  // { label: "Art Fairs", href: "/gallery/fairs", section: "programming" },

  // Operations
  {
    label: "Orders & Shipping",
    href: "/gallery/orders",
    section: "operations",
  },
  {
    label: "Subscription & Billing",
    href: "/gallery/billing",
    section: "operations",
  },
  { label: "Payouts", href: "/gallery/payouts", section: "operations" },
  {
    label: "Support Tickets",
    href: "/gallery/support",
    section: "operations",
  },

  // Configuration
  {
    label: "Profile Management",
    href: "/gallery/profile",
    section: "configuration",
  },
  { label: "Settings", href: "/gallery/settings", section: "configuration" },
];
