"use client";
import { use } from "react";
import PageTitle from "../../../components/PageTitle";
import QuoteForm from "../components/QuoteForm";
type Params = Promise<{ id: string }>;

export default function QuoteFormWrapper(props: { params: Params }) {
  const param_data = use(props.params);
  const order_id = param_data.id;
  return (
    <div>
      <QuoteForm order_id={order_id} />
    </div>
  );
}
