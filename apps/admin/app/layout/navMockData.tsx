import {
  CircleDollarSign,
  Cog,
  Landmark,
  LogOut,
  Newspaper,
  Palette,
  Proportions,
  UserRoundPen,
} from "lucide-react";

const gallery = (
  <Landmark
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const artist = (
  <Palette
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);

// const auction = <RiAuctionLine className="text-dark group-hover:text-white" />;
const profile = (
  <UserRoundPen
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const editorials = (
  <Newspaper
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const settings = (
  <Cog
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const logout = (
  <LogOut
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const taxes = (
  <CircleDollarSign
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
const promotionals = (
  <Proportions
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);

export const navMockData: NavMockData = {
  actions: [
    {
      title: "Gallery requests",
      icon: gallery,
      url: "/admin/requests/gallery",
    },
    { title: "Artist requests", icon: artist, url: "/admin/requests/artist" },
  ],
  activity: [
    {
      title: "Upload promotionals",
      icon: promotionals,
      url: "/admin/promotionals",
    },
    {
      title: "Upload editorials",
      icon: editorials,
      url: "/admin/editorials",
    },
    {
      title: "Revenue and tax activity",
      icon: taxes,
      url: "/admin/taxes",
    },
  ],
  management: [
    {
      title: "Manage team members",
      icon: profile,
      url: "/admin/members",
    },
  ],
  account: [
    { title: "Settings", icon: settings, url: "/admin/settings" },

    { title: "Sign out", icon: logout, url: "/" },
  ],
};

type NavMockData = {
  actions: NavMockDataItem[];
  activity: NavMockDataItem[];
  management: NavMockDataItem[];
  account: NavMockDataItem[];
};

type NavMockDataItem = {
  title: string;
  icon: React.ReactNode;
  url: string;
};
