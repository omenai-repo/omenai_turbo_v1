import PurchaseComponentWrapper from "./components/PurchaseComponentWrapper";

export default async function PurhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = decodeURIComponent(decodeURIComponent((await params).id));

  console.log(slug);
  return <PurchaseComponentWrapper slug={slug} />;
}
