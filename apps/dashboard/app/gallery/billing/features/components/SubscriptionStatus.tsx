"use client";

import { galleryModalStore } from "@omenai/shared-state-store/src/gallery/gallery_modals/GalleryModals";
import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import Link from "next/link";
import { daysLeft } from "@omenai/shared-utils/src/daysLeft";

export default function SubDetail({
  sub_data,
}: {
  sub_data: SubscriptionModelSchemaTypes & {
    createdAt: string;
    updatedAt: string;
  };
}) {
  const { updateOpenModal } = galleryModalStore();

  const currency_symbol = getCurrencySymbol(sub_data.plan_details.currency);
  return (
    <div className="ring-1 ring-[#e0e0e0] rounded-[20px] p-4 h-[250px] relative">
      <div className="w-full flex justify-start relative z-10 my-2">
        <p className="text-dark text-[14px] font-semibold">Subscription Info</p>
      </div>
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
            <h1 className="font-bold text-[14px]">
              Omenai {sub_data.plan_details.type}
            </h1>
            <p className="font-semibold text-[12px]">
              Due date: {formatIntlDateTime(sub_data.expiry_date)}
            </p>
            <p className="font-normal text-[13px]">
              {daysLeft(sub_data.expiry_date)} days left
            </p>
            <p
              className={`text-[13px] ${
                sub_data.status === "canceled" || sub_data.status === "expired"
                  ? "text-red-600"
                  : "text-green-600"
              }  font-bold`}
            >
              {sub_data.status.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold">
            {formatPrice(
              sub_data.plan_details.interval === "monthly"
                ? +sub_data.plan_details.value.monthly_price
                : +sub_data.plan_details.value.annual_price,
              currency_symbol
            )}{" "}
          </h1>
          <p className="text-[13px] self-end">
            {sub_data.plan_details.interval.replace(/^./, (char) =>
              char.toUpperCase()
            )}
          </p>
        </div>
      </div>
      <div className=" mt-4">
        {sub_data.status === "canceled" || sub_data.status === "expired" ? (
          <Link href={`/gallery/billing/plans?plan_action=reactivation`}>
            <button className=" h-[40px] px-4 rounded-sm w-fit text-[12px] 2xl:text-[14px] bg-dark text-white hover:bg-dark/70 flex gap-2 items-center">
              Reactivate Subscription
            </button>
          </Link>
        ) : (
          <div className="flex gap-x-2 items-center">
            <button
              className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 duration-300 text-white text-[14px] font-normal"
              onClick={() => updateOpenModal()}
            >
              {/* <RxCross1 className="text-base text-white" /> */}
              <span className="text-white whitespace-nowrap">
                Cancel Subscription
              </span>
            </button>
            <Link href="/gallery/billing/plans">
              <button className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal">
                <span className="text-white whitespace-nowrap">
                  Upgrade/Downgrade plan
                </span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
