"use client";
import BillingCard from "./components/BillingCard";
import BillingInfo from "./components/BillingInfo";
import CancelSubscriptionModal from "./components/CancelSubscriptionModal";

import TransactionTable from "./components/TransactionTable";
import SubDetail from "./components/SubscriptionStatus";
import UpcomingSub from "./components/UpcomingSub";

import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import type { PaymentMethod } from "@stripe/stripe-js";

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

  return (
    <div className="w-full h-full grid 2xl:grid-cols-3 gap-4 my-5">
      {/* Card */}
      <div className="flex flex-col gap-4 items-start w-full col-span-1 2xl:col-span-2">
        <div className="grid grid-cols-2 items-center gap-3 w-full">
          <div className="flex flex-col gap-y-2">
            <BillingCard
              paymentMethod={subscription_data.paymentMethod as PaymentMethod}
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
