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
import { auth_uri } from "@omenai/url-config/src/config";
import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SubscriptionActiveTheme({
  subscription_data,
  subscription_plan,
}: {
  subscription_data: SubscriptionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  };
  subscription_plan: SubscriptionPlanDataTypes & {
    createdAt: string;
    updatedAt: string;
  };
}) {
  const { user } = useAuth({ requiredRole: "gallery" });

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
              plan_id={subscription_plan.plan_id}
              plan_interval={subscription_data.plan_details.interval}
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
          id={user.gallery_id as string}
        />
      </div>

      <div className="col-span-1 w-full">
        <TransactionTable />
      </div>
    </div>
  );
}
