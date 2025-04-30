import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import Link from "next/link";
import { getFutureDate } from "@omenai/shared-utils/src/getFutureDate";
export default function UpcomingSub({
  sub_data,
}: {
  sub_data: SubscriptionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  };
}) {
  const currency_symbol = getCurrencySymbol(
    sub_data.next_charge_params.currency
  );

  return (
    <div className="ring-1 ring-[#e0e0e0] rounded-[20px] p-4 h-[250px] relative">
      <div className="w-full flex justify-start relative z-10 my-2">
        <p className="text-dark text-fluid-xs font-semibold">Upcoming</p>
      </div>
      {(sub_data.status === "canceled" || sub_data.status === "expired") && (
        <div className="flex flex-col gap-y-3">
          <p className="text-[13px] font-bold text-red-600">
            Subscription {sub_data.status}
          </p>
          <Link href={`/gallery/billing/plans?plan_action=reactivation`}>
            <button className=" h-[35px] px-4 rounded-full w-fit text-[13px] bg-dark text-white hover:bg-dark/70 flex gap-2 items-center">
              Reactivate Subscription
            </button>
          </Link>
        </div>
      )}
      {sub_data.status === "active" && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-3">
              <Image
                src={"/omenai_logo_cut.png"}
                width={20}
                height={20}
                alt="Omenai logo cut"
                className="w-fit h-fit"
              />
              <div>
                <h1 className="font-bold text-fluid-xs">
                  Omenai {sub_data.next_charge_params.type}
                </h1>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-fluid-base font-bold">
                {formatPrice(
                  sub_data.next_charge_params.value,
                  currency_symbol
                )}
              </h1>
              <p className="text-[13px] self-end">
                {sub_data.next_charge_params.interval.replace(/^./, (char) =>
                  char.toUpperCase()
                )}
              </p>
            </div>
          </div>
          <div className=" mt-5 w-full">
            <div className="flex flex-col gap-2 items-center justify-between px-4 font-semibold py-2 rounded-full bg-[#fafafa] text-[13px] ring-1 ring-[#e0e0e0]">
              <p className="whitespace-nowrap">
                <span className="font-bold">From:</span>{" "}
                {formatIntlDateTime(sub_data.expiry_date)}
              </p>
              <p className="whitespace-nowrap">
                <span className="font-bold">To:</span>{" "}
                {getFutureDate(
                  sub_data.expiry_date,
                  sub_data.next_charge_params.interval
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
