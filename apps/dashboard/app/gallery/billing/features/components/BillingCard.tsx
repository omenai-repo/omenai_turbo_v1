import Image from "next/image";
import Link from "next/link";

export default function BillingCard({
  expiry,
  first_6digits,
  last_4digits,
  type,
  plan_id,
  plan_interval,
}: {
  expiry: string;
  first_6digits: string;
  last_4digits: string;
  type: string;
  plan_id: string;
  plan_interval: string;
}) {
  return (
    <div
      className="rounded-2xl ring-1 bg-billing-card ring-[#e0e0e0] bg-no-repeat text-white bg-blend-overlay p-4 relative w-full h-[250px]"
      style={{ backgroundImage: "url('/curve.png')" }}
    >
      <div className="absolute inset-0 bg-dark/50 rounded-2xl" />
      <div className="w-full flex justify-start relative z-10 my-2">
        <p className="text-white text-fluid-xs font-semibold">
          Billing card details
        </p>
      </div>
      {/* Icon */}
      <div className="flex flex-col 2xl:flex-row justify-between 2xl:items-center relative z-10">
        <div>
          <div className="flex space-x-3 items-center">
            <p className="text-fluid-sm  text-white font-semibold whitespace-nowrap tracking-[0.15rem]">
              {first_6digits} ** **** {last_4digits}
            </p>
          </div>
          <p className="text-normal text-fluid-base font-semibold text-white ">
            {expiry}
          </p>
        </div>

        <Image
          src={`/icons/${type.toLowerCase()}.png`}
          alt={`${type.toLowerCase()} logo`}
          height={20}
          width={40}
          className="w-fit h-fit mt-5 2xl:mt-0"
        />
      </div>
      <Link
        href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan_id}&plan_interval=${plan_interval}`}
        className="w-full flex justify-start absolute bottom-5 left-4"
      >
        <button className="flex gap-2 items-center disabled:cursor-not-allowed hover:ring hover:ring-white disabled:bg-dark/20 place-items-center rounded-full text-[13px] bg-white h-[35px] px-4 text-dark hover:text-white hover:bg-dark duration-300">
          <span>Change card</span>
        </button>
      </Link>
    </div>
  );
}
