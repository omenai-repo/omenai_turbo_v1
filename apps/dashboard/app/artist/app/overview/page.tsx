import Highlight from "./features/highlight/Highlight";
import Orders from "./features/orders/Orders";
import PopularArtworks from "./features/popular_artworks/PopularArtworks";
import ActivityWrapper from "./features/sales_activity/ActivityWrapper";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return (
    <div className="w-full">
      <Highlight />
      <ActivityWrapper />
      <div className="grid lg:grid-cols-2 space-x-6 mt-[96px] py-4">
        <Orders />
        <PopularArtworks />
      </div>
    </div>
  );
}
