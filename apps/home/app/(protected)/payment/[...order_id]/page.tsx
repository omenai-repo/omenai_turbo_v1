import OrderPaymentClientWrapper from "./OrderPaymentClientWrapper";

export default async function OrderPayment({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const slug = (await params).order_id;

  return <OrderPaymentClientWrapper order_id={slug} />;
}
