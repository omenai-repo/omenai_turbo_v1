import OrdersGroup from "./components/OrdersGroup";
import PageTitle from "../components/PageTitle";
export const dynamic = "force-dynamic";

export default function Orders() {
  return (
    <>
      <PageTitle title="Orders" />
      <OrdersGroup />
    </>
  );
}
