"use client";
import React from "react";
import MapView from "../components/Mapview";
import EventTimeline from "../components/EventTimeline";
import { useQuery } from "@tanstack/react-query";
import { getTrackingData } from "@omenai/shared-services/orders/getTrackingData";
import TrackingLoader from "@omenai/shared-ui-components/components/skeletons/TrackingLoader";
import { useWindowSize } from "usehooks-ts";

export default function Tracking({ order_id }: { order_id: string }) {
  const { width } = useWindowSize();
  const { data: tracking_data, isLoading: loading } = useQuery({
    queryKey: ["get_tracking_details"],
    queryFn: async () => {
      const response = await getTrackingData(order_id);

      if (!response?.isOk)
        throw new Error(
          response?.message ||
            "Tracking data currently unavailable. Please try again",
        );

      return {
        events: response.events,
        coordinates: response.coordinates,
        order_date: response.order_date,
        artwork_data: response.artwork_data,
        tracking_number: response.tracking_number,
      };
    },
    refetchOnWindowFocus: false,
  });

  if (loading) return <TrackingLoader />;
  return (
    <>
      <div className="relative w-full h-[calc(100dvh-10rem)] mt-4 flex ">
        <div className={`${width < 1280 && "absolute left-0 top-0 p-5"}`}>
          <EventTimeline
            events={tracking_data?.events}
            order_date={tracking_data?.order_date}
            artwork_data={tracking_data?.artwork_data}
            tracking_number={tracking_data?.tracking_number}
          />
        </div>

        <div className="w-full h-full pb-5">
          <MapView />
        </div>
      </div>
    </>
  );
}
