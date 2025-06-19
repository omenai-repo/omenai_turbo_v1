"use client";
import OrdersGroup from "./components/OrdersGroup";
import PageTitle from "../components/PageTitle";

export default function Orders() {
  return (
    <>
      <PageTitle title="Orders" />
      <OrdersGroup />
    </>
  );
}
