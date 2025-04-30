import PageTitle from "../components/PageTitle";
import SubscriptionBase from "./SubscriptionBase";

export default function Subscription() {
  return (
    <div className="p-5 w-full h-full relative">
      <PageTitle title="Subscriptions & Billing" />
      <SubscriptionBase />
    </div>
  );
}
