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

const overview = <CiGrid41 className="text-dark group-hover:text-white" />;
const order = <TfiPackage className="text-dark group-hover:text-white" />;
const subscription = (
  <BsCreditCard2Front className="text-dark group-hover:text-white" />
);
// const auction = <RiAuctionLine className="text-dark group-hover:text-white" />;
const upload = <CiExport className="text-dark group-hover:text-white" />;
const profile = <CiUser className="text-dark group-hover:text-white" />;
const settings = <CiSettings className="text-dark group-hover:text-white" />;
const logout = <CiLogout className="text-dark group-hover:text-white" />;
const album = <IoAlbumsOutline className="text-dark group-hover:text-white" />;
const wallet = <IoWalletOutline className="text-dark group-hover:text-white" />;
const stripe = <FaStripe className="text-dark group-hover:text-white" />;
export const navMockData: NavMockData = {
  general: [
    { title: "Overview", icon: overview, url: "/gallery/overview" },
    { title: "Orders", icon: order, url: "/gallery/orders" },
    {
      title: "My artworks",
      icon: album,
      url: "/gallery/artworks",
    },
    {
      title: "Subscription & Billing",
      icon: subscription,
      url: "/gallery/billing",
    },
  ],
  account: [
    {
      title: "Payout with Stripe",
      icon: stripe,
      url: "/gallery/payouts",
    },
    {
      title: "Profile management",
      icon: profile,
      url: "/gallery/profile",
    },
    { title: "Settings", icon: settings, url: "/gallery/settings" },

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
