"use client";
import BillingCard from "./components/BillingCard";
import BillingInfo from "./components/BillingInfo";
import CancelSubscriptionModal from "./components/CancelSubscriptionModal";

import { useRouter } from "next/navigation";
import TransactionTable from "./components/TransactionTable";
import SubDetail from "./components/SubscriptionStatus";
import UpcomingSub from "./components/UpcomingSub";
import { useLocalStorage } from "usehooks-ts";
import { useContext, useEffect } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { auth_uri } from "@omenai/url-config/src/config";

export default function SubscriptionActiveTheme({
  subscription_data,
}: {
  subscription_data: any;
}) {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = auth_uri();
  if (session === null || session === undefined) router.replace(url);

  const [trans_id, set_trans_id] = useLocalStorage("flw_trans_id", "");

  useEffect(() => {
    set_trans_id("");
  }, [set_trans_id]);

  return (
    <div className="w-full h-full grid 2xl:grid-cols-3 gap-4 my-5">
      {/* Card */}
      <div className="flex flex-col gap-4 items-start w-full col-span-1 2xl:col-span-2">
        <div className="grid grid-cols-2 items-center gap-3 w-full">
          <div className="flex flex-col gap-y-2">
            <BillingCard
              expiry={subscription_data.card.expiry}
              first_6digits={subscription_data.card.first_6digits}
              last_4digits={subscription_data.card.last_4digits}
              type={subscription_data.card.type}
            />
          </div>

          <SubDetail sub_data={subscription_data} />
        </div>

        <div className="grid grid-cols-2 items-center gap-3 w-full">
          <UpcomingSub sub_data={subscription_data} />

          <BillingInfo />
        </div>

        <CancelSubscriptionModal
          sub_end={subscription_data.expiry_date}
          id={session?.gallery_id as string}
        />
      </div>

      <div className="col-span-1 w-full">
        <TransactionTable />
      </div>
    </div>
  );
}
