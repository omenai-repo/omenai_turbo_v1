"use client";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import PayNowButton from "./PayNowButton";
import { calculatePurchaseGrandTotalNumber } from "@omenai/shared-utils/src/calculatePurchaseGrandTotal";

export default function OrderDetails({
  order,
  lock_status,
}: {
  order: CreateOrderModelTypes;
  lock_status: boolean;
}) {
  const image_href = getOptimizedImage(order.artwork_data.url, "thumbnail", 40);

  const total_price_number = calculatePurchaseGrandTotalNumber(
    order.artwork_data.pricing.usd_price,
    +order.shipping_details.shipment_information.quote.fees,
    +order.shipping_details.shipment_information.quote.taxes
  );
  return (
    <div className="p-4 max-w-[600px]">
      <div className="w-fit h-full">
        <div className="w-full">
          <div className="shadow-lg px-5 py-6 rounded">
            <div className="flex flex-col gap-2">
              <Image
                src={image_href}
                height={100}
                width={100}
                alt={order.artwork_data.title + " image"}
                className=" w-[100px] h-[100px] cursor-pointer rounded"
              />
              <div className="">
                <div className="flex flex-col gap-y-1">
                  <p className="font-semibold text-dark text-fluid-xs">
                    {order.artwork_data.title}
                  </p>
                  <p className="font-medium text-fluid-xs text-dark">
                    {order.artwork_data.artist}
                  </p>
                </div>
              </div>
            </div>
            <hr className="border-[#e0e0e0] my-4" />

            <div className="text-fluid-xs">
              <div className="flex flex-col text-dark my-3">
                <p>Delivery address</p>
                <p className="font-semibold text-dark">
                  {order.shipping_details.addresses.destination.address_line},{" "}
                  {order.shipping_details.addresses.destination.city},{" "}
                  {order.shipping_details.addresses.destination.state},{" "}
                  {order.shipping_details.addresses.destination.country}
                </p>
              </div>
              {/* Uncomment when the new endpoint has been connected */}
              <div className="flex flex-col text-dark my-3">
                <p>Shipping carrier</p>
                <p className="font-semibold">
                  {order.shipping_details.shipment_information.carrier}
                </p>
              </div>
              <div className="flex flex-col  my-3 text-dark">
                <p>Price</p>
                <p className="font-semibold">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </p>
              </div>
              <div className="flex flex-col text-dark my-3">
                <p>Shipping</p>
                <p className="font-semibold">
                  {formatPrice(
                    order.shipping_details.shipment_information.quote.fees
                  )}
                </p>
              </div>
              <div className="flex flex-col text-dark my-3">
                <p>Taxes</p>
                <p className="font-semibold">
                  {formatPrice(
                    order.shipping_details.shipment_information.quote.taxes
                  )}
                </p>
              </div>

              <div className="flex flex-col font-bold text-fluid-base mt-10">
                <p>Grand total</p>
                <p className="text-fluid-base font-bold">
                  {formatPrice(total_price_number)}
                </p>
              </div>
              <p className="my-3 text-dark italic text-fluid-xs">
                *Additional duties and taxes may apply at import
              </p>

              <div>
                <PayNowButton
                  art_id={order.artwork_data.art_id}
                  artwork={order.artwork_data.title}
                  amount={total_price_number}
                  seller_id={order.seller_details.id}
                  lock_status={lock_status}
                  seller_email={order.seller_details.email}
                  seller_name={order.seller_details.name}
                  role_access={order.seller_designation}
                  shipping_cost={
                    +order.shipping_details.shipment_information.quote.fees
                  }
                  tax_fees={
                    +order.shipping_details.shipment_information.quote.taxes
                  }
                  unit_price={order.artwork_data.pricing.usd_price}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
