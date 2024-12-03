"use client";
import { Suspense, useState } from "react";
import GalleryList from "./GalleryList";
import TabSelector from "./TabSelector";
import VerifiedGalleryList from "./VerifiedGalleryList";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function TabGroup() {
  const [tab, setTab] = useState("pending");

  return (
    <>
      <div className="w-full p-10 grid place-items-center">
        <TabSelector tab={tab} setTab={setTab} />
      </div>
      <div className="w-full h-full grid place-items-center container">
        {tab === "pending" ? (
          <Suspense fallback={<Load />}>
            {/* <PendingOrders orders={orders} /> */}
            <GalleryList />
          </Suspense>
        ) : tab === "verified" ? (
          <Suspense fallback={<Load />}>
            <VerifiedGalleryList />
            {/* <OrderHistory orders={orders} /> */}
          </Suspense>
        ) : (
          <Suspense fallback={<Load />}>
            <p>Rejected</p>
            {/* <OrderHistory orders={orders} /> */}
          </Suspense>
        )}
      </div>
    </>
  );
}
