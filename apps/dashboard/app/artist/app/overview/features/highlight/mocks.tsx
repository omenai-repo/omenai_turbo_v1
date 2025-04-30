import {
  BadgeDollarSign,
  BanknoteArrowUp,
  ImageUp,
  Wallet,
} from "lucide-react";

const wallet = (
  <Wallet
    strokeWidth={1.5}
    absoluteStrokeWidth
    className="text-blue-600 text-fluid-sm"
  />
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
    title: "Wallet Balance",
    icon: wallet,
    tag: "balance",
    color: "bg-blue-600/10",
  },
  {
    title: "Total net earned",
    icon: net,
    tag: "net",
    color: "bg-green-600/10",
  },
  {
    title: "Total sales revenue",
    icon: sales_revenue,
    tag: "revenue",
    color: "bg-purple-600/10",
  },
  {
    title: "Artworks sold",
    icon: art_sold,
    tag: "sales",
    color: "bg-orange-600/10",
  },
];

type HighlightCardElProps = {
  title: string;
  icon: React.ReactNode;
  value?: string;
  tag: string;
  color: string;
};
