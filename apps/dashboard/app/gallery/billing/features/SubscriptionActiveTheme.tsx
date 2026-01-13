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
    <div className="w-full max-w-full py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(200px,auto)]">
        {/* Row 1: Status (Hero) and Billing Method */}
        <div className="lg:col-span-7 lg:row-span-2">
          <SubDetail sub_data={subscription_data} />
        </div>

        <div className="lg:col-span-5">
          <BillingCard
            paymentMethod={subscription_data.paymentMethod as PaymentMethod}
            plan_id={subscription_plan.plan_id}
            plan_interval={subscription_data.plan_details.interval}
          />
        </div>

        {/* Row 2: Smaller details */}
        <div className="lg:col-span-5">
          <BillingInfo />
        </div>
        <div className="lg:col-span-4 max-h-[300px]">
          <UpcomingSub sub_data={subscription_data} />
        </div>

        {/* Row 3: Transactions (Full Height Side or Bottom depending on screen) */}
        <div className="lg:col-span-8 lg:row-span-2 lg:-mt-[224px] xl:mt-0 xl:row-span-1 xl:col-span-8">
          {/* Note: The negative margin on LG allows it to tuck under the Billing Card if space permits, 
                otherwise standard grid behavior applies. For simplicity, standard grid: */}
          <div className="h-full max-h-[650px]">
            <TransactionTable />
          </div>
        </div>
      </div>

      <CancelSubscriptionModal
        sub_end={subscription_data.expiry_date}
        id={user.gallery_id as string}
      />
    </div>
  );
}
