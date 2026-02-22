"use client";
import { use } from "react";
import QuoteForm from "../components/QuoteFormV2";
type Params = Promise<{ id: string }>;

export default function QuoteFormWrapper(props: { params: Params }) {
  const param_data = use(props.params);
  const order_id = param_data.id[0];
  return (
    <div>
      <QuoteForm order_id={order_id} />
    </div>
  );
}
