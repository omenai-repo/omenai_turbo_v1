import OrdersGroup from "./components/OrdersGroup";
import PageTitle from "../components/PageTitle";

export default async function Orders() {
  return (
    <>
      <PageTitle title="Orders" />
      <OrdersGroup />
    </>
  );
}
