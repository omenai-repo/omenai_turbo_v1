import { CiBoxList } from "react-icons/ci";
import { TbChartHistogram } from "react-icons/tb";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { BadgeDollarSign, BanknoteArrowUp, ImageUp } from "lucide-react";

const total_artworks_icon = (
  <CiBoxList className="text-purple-600 text-fluid-sm" />
);
const sales_revenue = (
  <BadgeDollarSign
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-purple-600 text-fluid-sm"
  />
);
const net = (
  <BanknoteArrowUp
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-green-600"
  />
);

const art_sold = (
  <ImageUp
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-orange-600 text-fluid-sm"
  />
);

export const highlightCardEl: HighlightCardElProps[] = [
  {
    title: "Total net earned",
    icon: net,
    tag: "net",
    color: "bg-white",
  },
  {
    title: "Total Revenue",
    icon: sales_revenue,
    tag: "revenue",
    color: "bg-white",
  },
  {
    title: "Total artworks uploaded",
    icon: total_artworks_icon,
    tag: "artworks",
    color: "bg-white",
  },
  {
    title: "Sold artworks",
    icon: art_sold,
    tag: "sales",
    color: "bg-white",
  },
];

type HighlightCardElProps = {
  title: string;
  icon: React.ReactNode;
  value?: string;
  tag: string;
  color: string;
};
