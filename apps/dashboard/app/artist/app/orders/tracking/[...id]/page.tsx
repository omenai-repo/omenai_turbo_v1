"use client";
import React from "react";
import MapView from "../components/Mapview";
import PageTitle from "../../../components/PageTitle";
import EventTimeline from "../components/EventTimeline";
import { useQuery } from "@tanstack/react-query";
import { getTrackingData } from "@omenai/shared-services/orders/getTrackingData";
import Load from "@omenai/shared-ui-components/components/loader/Load";

import { use } from "react";

type Params = Promise<{ id: string }>;

export default function Tracking(props: { params: Params }) {
  const { data: tracking_data, isLoading: loading } = useQuery({
    queryKey: ["get_tracking_details"],
    queryFn: async () => {
      const param_data = use(props.params);
      const order_id = param_data.id;
      const response = await getTrackingData(order_id);

      console.log(response);
      if (!response?.isOk)
        throw new Error(
          response?.message ||
            "Tracking data currently unavailable. Please try again"
        );

      return { events: response.events, coordinates: response.coordinates };
    },
    refetchOnWindowFocus: false,
  });

  if (loading) return <Load />;
  return (
    <>
      <PageTitle title="Track package" />
      <div className="relative w-full h-[calc(100dvh-10rem)] mt-4 flex ">
        <EventTimeline events={tracking_data?.events} />
        <MapView />
      </div>
    </>
  );
}
