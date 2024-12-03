import { BsCreditCard2Front } from "react-icons/bs";
// import { RiAuctionLine } from "react-icons/ri";
import { IoAlbumsOutline, IoDocumentTextOutline } from "react-icons/io5";

import { CiUser, CiLogout, CiGrid41, CiExport } from "react-icons/ci";

const overview = <CiGrid41 className="text-dark group-hover:text-white" />;
const subscription = (
  <BsCreditCard2Front className="text-dark group-hover:text-white" />
);
// const auction = <RiAuctionLine className="text-dark group-hover:text-white" />;
const upload = <CiExport className="text-dark group-hover:text-white" />;
const profile = <CiUser className="text-dark group-hover:text-white" />;
const logout = <CiLogout className="text-dark group-hover:text-white" />;
const album = <IoAlbumsOutline />;
const editorial = <IoDocumentTextOutline />;

export const navMockData: NavMockData = {
  general: [
    {
      title: "Gallery signup requests",
      icon: overview,
      url: "/admin/dashboard/galleries",
    },
    {
      title: "Upload home advert",
      icon: upload,
      url: "/admin/dashboard/upload_home_advert",
    },
    {
      title: "Manage promo contents",
      icon: album,
      url: "/admin/dashboard/manage_promo_contents",
    },
    {
      title: "Editorials",
      icon: editorial,
      url: "/admin/dashboard/editorials",
    },
  ],
  account: [
    {
      title: "Update credentials",
      icon: profile,
      url: "/admin/dashboard/update_creds",
    },
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
