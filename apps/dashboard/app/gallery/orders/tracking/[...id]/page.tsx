"use client";
import React, { use } from "react";
import PageTitle from "../../../components/PageTitle";
import Tracking from "./Tracker";
type Params = Promise<{ id: string }>;

export default function TrackerWrapper(props: { params: Params }) {
  const param_data = use(props.params);
  const order_id = param_data.id;
  return (
    <div>
      <PageTitle title="Track package" />
      <Tracking order_id={order_id} />
    </div>
  );
}
