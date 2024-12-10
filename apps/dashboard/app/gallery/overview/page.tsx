import { Suspense } from "react";
import Tour from "../components/Tour";
import Highlight from "./features/highlight/Highlight";
import Orders from "./features/orders/Orders";
import PopularArtworks from "./features/popular_artworks/PopularArtworks";
import ActivityWrapper from "./features/sales_activity/ActivityWrapper";
import PageTitle from "../components/PageTitle";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function OverviewPage() {
  return (
    <div className="w-full">
      <Tour />
      <PageTitle title={"Overview"} />
      <div className="my-5">
        <Highlight />
        <Suspense fallback={<Load />}>
          <ActivityWrapper />
        </Suspense>

        <div className="grid lg:grid-cols-2 gap-x-[1rem] pb-4">
          <Suspense fallback={<Load />}>
            <Orders />
          </Suspense>

          <Suspense fallback={<Load />}>
            <PopularArtworks />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
