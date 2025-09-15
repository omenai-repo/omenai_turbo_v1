import Tour from "../components/Tour";
import Highlight from "./features/highlight/Highlight";
import Orders from "./features/orders/Orders";
import PopularArtworks from "./features/popular_artworks/PopularArtworks";
import ActivityWrapper from "./features/sales_activity/ActivityWrapper";
import PageTitle from "../components/PageTitle";
export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return (
    <div className="w-full">
      <Tour />
      <PageTitle title={"Overview"} />
      <Highlight />
      <ActivityWrapper />
      <div className="grid lg:grid-cols-2 gap-x-[1rem] mt-[64px]">
        <Orders />
        <PopularArtworks />
      </div>
    </div>
  );
}
