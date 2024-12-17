import PurchaseComponentWrapper from "./components/PurchaseComponentWrapper";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { redirect } from "next/navigation";
import { login_url } from "@omenai/url-config/src/config";

export default async function PurhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const login_base_url = login_url();
  const session = await getServerSession();
  const slug = decodeURIComponent((await params).id);

  if (session === undefined) {
    redirect(login_base_url);
  }

  return <PurchaseComponentWrapper slug={slug} />;
}
