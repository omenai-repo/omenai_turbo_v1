"use client";

import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { CheckoutStepper } from "../plans/checkout/components/CheckoutStepper";

export default function ChangeCardPage(): JSX.Element {
  return (
    <div>
      {/* Page Title */}
      <PageTitle title="Change card" />

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3">
        {/* Left Column */}
        <div className="col-span-1">
          <CardChangeCheckoutItem />
          <CheckoutStepper />
        </div>

        {/* Right Column (Reserved for future content) */}
        <div className="col-span-2">{/* Future content goes here */}</div>
      </div>
    </div>
  );
}
