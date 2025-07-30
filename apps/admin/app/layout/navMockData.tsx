import { TeamMember } from "@omenai/shared-types";
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
import { KeyList } from "../utils/canAccessRoute";

export const gallery = (
  <Landmark
    size={20}
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-dark group-hover:text-white"
  />
);
export const artist = (
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
export const promotionals = (
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
      key: "requests",
    },
    {
      title: "Artist requests",
      icon: artist,
      url: "/admin/requests/artist",
      key: "requests",
    },
  ],
  activity: [
    {
      title: "Upload promotionals",
      icon: promotionals,
      url: "/admin/promotionals",
      key: "promotionals",
    },
    {
      title: "Upload editorials",
      icon: editorials,
      url: "/admin/editorials",
      key: "editorials",
    },
    {
      title: "Revenue and tax activity",
      icon: taxes,
      url: "/admin/taxes",
      key: "taxes",
    },
  ],
  management: [
    {
      title: "Team members",
      icon: profile,
      url: "/admin/members",
      key: "team",
    },
  ],
  account: [
    {
      title: "Settings",
      icon: settings,
      url: "/admin/settings",
      key: "settings",
    },

    { title: "Sign out", icon: logout, url: "/", key: "logout" },
  ],
};

export type NavMockData = {
  actions: NavMockDataItem[];
  activity: NavMockDataItem[];
  management: NavMockDataItem[];
  account: NavMockDataItem[];
};

type NavMockDataItem = {
  title: string;
  icon: React.ReactNode;
  url: string;
  key: KeyList;
};
