import { TfiPackage } from "react-icons/tfi";
import { BsCreditCard2Front } from "react-icons/bs";
// import { RiAuctionLine } from "react-icons/ri";
import { IoAlbumsOutline, IoWalletOutline } from "react-icons/io5";

import {
  CiUser,
  CiSettings,
  CiLogout,
  CiGrid41,
  CiExport,
} from "react-icons/ci";
import { FaStripeS } from "react-icons/fa";
import { FaStripe } from "react-icons/fa6";

const overview = <CiGrid41 className="text-white group-hover:text-white" />;
const order = <TfiPackage className="text-white group-hover:text-white" />;
const subscription = (
  <BsCreditCard2Front className="text-white group-hover:text-white" />
);
// const auction = <RiAuctionLine className="text-white group-hover:text-white" />;
const upload = <CiExport className="text-white group-hover:text-white" />;
const profile = <CiUser className="text-white group-hover:text-white" />;
const settings = <CiSettings className="text-white group-hover:text-white" />;
const album = <IoAlbumsOutline className="text-white group-hover:text-white" />;

const stripe = <FaStripe className="text-white group-hover:text-white" />;
export const navMockData = [
  { title: "Overview", icon: overview, url: "/artist/app/overview" },
  { title: "Orders", icon: order, url: "/artist/app/orders" },
  {
    title: "My artworks",
    icon: album,
    url: "/artist/app/artworks",
  },
  {
    title: "Wallet",
    icon: subscription,
    url: "/artist/app/billing",
  },
  {
    title: "Profile management",
    icon: profile,
    url: "/artist/app/profile",
  },
  {
    title: "Settings",
    icon: settings,
    url: "/artist/app/settings",
  },
];

type NavMockData = {
  general: NavMockDataItem[];
  account: NavMockDataItem[];
};

type NavMockDataItem = {
  title: string;
  icon: React.ReactNode;
  url: string;
};
