import React from "react";
import Accordion from "./Accordion";
import { GrSecure } from "react-icons/gr";
import { HiBadgeCheck } from "react-icons/hi";
import { RiExchangeDollarLine } from "react-icons/ri";

const shipping_taxes = [
  { icon: <></>, content: "Shipping: Calculated in checkout" },
  { icon: <></>, content: "Taxes may apply at checkout" },
];
const omenai_guarantee = [
  {
    icon: <GrSecure />,
    content: "Secure Checkout",
  },
  {
    icon: <HiBadgeCheck />,
    content: "Authenticity Guarantee",
  },
];
export default function LegalComponents() {
  return (
    <div className="flex flex-col space-y-5 my-5">
      <Accordion header="Shipping & Taxes" items={shipping_taxes} />
      <Accordion
        header="Be covered by the Omenai Guarantee when you checkout with Omenai"
        items={omenai_guarantee}
      />
    </div>
  );
}
