import { CiBoxList } from "react-icons/ci";
import { TbChartHistogram } from "react-icons/tb";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdOutlineWorkspacePremium } from "react-icons/md";

const total_artworks_icon = <CiBoxList className="text-purple-600 text-sm" />;
const total_impressions_icon = (
  <TbChartHistogram className="text-orange-600 text-sm" />
);
const sold_artworks_icon = (
  <RiMoneyDollarCircleLine className="text-green-600 text-sm" />
);
const subscription_type_icon = (
  <MdOutlineWorkspacePremium className="text-red-600 text-sm" />
);

export const highlightCardEl: HighlightCardElProps[] = [
  {
    title: "Total artworks",
    icon: total_artworks_icon,
    tag: "artworks",
    color: "bg-purple-600/10",
  },
  {
    title: "Total impressions",
    icon: total_impressions_icon,
    tag: "impressions",
    color: "bg-orange-600/10",
  },
  {
    title: "Sold artworks",
    icon: sold_artworks_icon,
    tag: "sales",
    color: "bg-green-600/10",
  },
  {
    title: "Subscription",
    icon: subscription_type_icon,
    tag: "subscription",
    color: "bg-red-400/10",
  },
];

type HighlightCardElProps = {
  title: string;
  icon: React.ReactNode;
  value?: string;
  tag: string;
  color: string;
};
