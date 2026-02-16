import PurchaseComponentWrapper from "./components/PurchaseComponentWrapper";

export default async function PurhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = decodeURIComponent(decodeURIComponent((await params).id[0]));

  return <PurchaseComponentWrapper slug={slug} />;
}
