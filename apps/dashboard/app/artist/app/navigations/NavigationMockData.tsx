import {
  ImageUp,
  Kanban,
  LogOut,
  Settings,
  ShoppingBasket,
  UserRoundPen,
  Wallet,
} from "lucide-react";
const overview = (
  <Kanban
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);
const order = (
  <ShoppingBasket
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);

// const auction = <RiAuctionLine className="text-gray-700 group-hover:text-white" />;
const wallet = (
  <Wallet
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);
const profile = (
  <UserRoundPen
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);
const settings = (
  <Settings
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);
const logout = (
  <LogOut
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);
const artworks = (
  <ImageUp
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-gray-700 group-hover:text-white"
  />
);

export const navMockData: NavMockData = {
  general: [
    { title: "Overview", icon: overview, url: "/artist/app/overview" },
    { title: "Orders", icon: order, url: "/artist/app/orders" },
    {
      title: "My artworks",
      icon: artworks,
      url: "/artist/app/artworks",
    },
    {
      title: "Wallet",
      icon: wallet,
      url: "/artist/app/wallet",
    },
  ],
  account: [
    {
      title: "Profile management",
      icon: profile,
      url: "/artist/app/profile",
    },
    { title: "Settings", icon: settings, url: "/artist/app/settings" },

    { title: "Sign out", icon: logout, url: "/" },
  ],
};

type NavMockData = {
  general: NavMockDataItem[];
  account: NavMockDataItem[];
};

type NavMockDataItem = {
  title: string;
  icon: React.ReactNode;
  url: string;
};
