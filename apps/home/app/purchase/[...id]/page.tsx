import PurchaseComponentWrapper from "./components/PurchaseComponentWrapper";

export default async function PurhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = decodeURIComponent((await params).id);

  return <PurchaseComponentWrapper slug={slug} />;
}
