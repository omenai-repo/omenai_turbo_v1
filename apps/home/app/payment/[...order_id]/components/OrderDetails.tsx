"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
/* eslint-disable @next/next/no-img-element */

import PayNowButton from "./PayNowButton";
import { calculatePurchaseGrandTotalNumber } from "@omenai/shared-utils/src/calculatePurchaseGrandTotal";

export default function OrderDetails({
  order,
  lock_status,
}: {
  order: CreateOrderModelTypes;
  lock_status: boolean;
}) {
  const image_href = getImageFileView(order.artwork_data.url, 200);

  const total_price_number = calculatePurchaseGrandTotalNumber(
    order.artwork_data.pricing.usd_price,
    order.shipping_details.quote.fees,
    order.shipping_details.quote.taxes
  );
  return (
    <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 my-[3rem] p-5 gap-4">
      <div className="col-span-1 xl:col-span-2">
        <PayNowButton
          art_id={order.artwork_data.art_id}
          artwork={order.artwork_data.title}
          amount={total_price_number}
          seller_id={order.seller_details.id}
          lock_status={lock_status}
          seller_email={order.seller_details.email}
          seller_name={order.seller_details.name}
        />
      </div>

      <div className="w-full cols-span-1 h-full">
        <div className="w-full">
          <div className="border border-[#e0e0e0] px-5 py-12">
            <div className="flex flex-col gap-2">
              <img
                src={image_href}
                alt={order.artwork_data.title + " image"}
                className="w-auto max-w-[200px] max-h-[400px] h-auto aspect-auto object-top object-contain cursor-pointer"
              />
              <div className="">
                <div className="flex flex-col gap-y-1">
                  <p className="font-bold text-dark text-base">
                    {order.artwork_data.title.substring(0, 20)}
                    {order.artwork_data.title.length > 20 && "..."}
                  </p>
                  <p className="font-normal text-base text-[#858585]">
                    {order.artwork_data.artist.substring(0, 20)}
                    {order.artwork_data.artist.length > 20 && "..."}
                  </p>
                </div>
              </div>
            </div>
            <hr className="border-[#e0e0e0] my-8" />

            <div className="text-[14px]">
              <div className="flex justify-between items-center text-[#858585] my-3">
                <p>Delivery address</p>
                <p className="font-bold">
                  {order.shipping_details.addresses.destination.address_line},{" "}
                  {order.shipping_details.addresses.destination.city},{" "}
                  {order.shipping_details.addresses.destination.state},{" "}
                  {order.shipping_details.addresses.destination.country}
                </p>
              </div>
              <div className="flex justify-between items-center text-[#858585] my-3">
                <p>Shipping carrier</p>
                <p className="font-bold">
                  {order.shipping_details.quote.package_carrier}
                </p>
              </div>
              <div className="flex justify-between items-center  my-3 text-[#858585]">
                <p>Price</p>
                <p className="font-bold">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </p>
              </div>
              <div className="flex justify-between items-center text-[#858585] my-3">
                <p>Shipping</p>
                <p className="font-bold">
                  ${order.shipping_details.quote.fees}
                </p>
              </div>
              <div className="flex justify-between items-center text-[#858585] my-3">
                <p>Taxes</p>
                <p className="font-bold">
                  ${order.shipping_details.quote.taxes}
                </p>
              </div>

              <div className="flex justify-between items-center font-normal text-base mt-10">
                <p>Grand total</p>
                <p className="text-sm font-bold">
                  {formatPrice(total_price_number)}
                </p>
              </div>
              <p className="my-3 text-[#858585] italic text-[14px]">
                *Additional duties and taxes may apply at import
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
