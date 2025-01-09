"use client";

import { PiSealWarning } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

export default function OrderActionModalForm() {
  const {
    galleryOrderActionModalData,
    toggleGalleryOrderActionModal,
    toggleDeclineOrderModal,
    update_current_order_id,
  } = actionStore();

  function handleDeclineOrderRequest() {
    toggleGalleryOrderActionModal(false);
    update_current_order_id(galleryOrderActionModalData.order_id);
    toggleDeclineOrderModal(true);
  }

  function routeToQuote() {
    toggleGalleryOrderActionModal(false);
  }

  const image_url = getImageFileView(
    galleryOrderActionModalData.artwork.url,
    200
  );

  return (
    <>
      <div className="p-3 border border-[#E0E0E0] rounded-lg">
        <div className="flex flex-col gap-y-4 text-xs">
          <div className="flex flex-col">
            <Image
              src={image_url}
              alt={galleryOrderActionModalData.artwork.title}
              height={100}
              width={80}
              className="object-top object-contain"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#858585]">Artwork name</p>
            <p>{galleryOrderActionModalData.artwork.title}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#858585]">Artist name</p>
            <p>{galleryOrderActionModalData.artwork.artist}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#858585]">Price</p>
            <p>
              {formatPrice(
                galleryOrderActionModalData.artwork.pricing.usd_price
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#858585]">Buyer name</p>
            <p>{galleryOrderActionModalData.buyer}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-[#858585]">Buyer address</p>
            <p>
              {galleryOrderActionModalData.shipping_address.address_line},{" "}
              {galleryOrderActionModalData.shipping_address.city},{" "}
              {galleryOrderActionModalData.shipping_address.state},{" "}
              {galleryOrderActionModalData.shipping_address.country},{" "}
              {galleryOrderActionModalData.shipping_address.zip}
            </p>
          </div>

          {galleryOrderActionModalData.status === "pending" && (
            <div className="bg-green-100 px-3 py-2 font-normal rounded-md flex items-center gap-x-2">
              <PiSealWarning />
              <p>
                Please confirm buyer&apos;s shipping address before providing
                quote
              </p>
            </div>
          )}
        </div>
      </div>
      {galleryOrderActionModalData.status === "processing" && (
        <div className="my-4 flex items-center justify-center gap-x-2 w-full text-[13px]">
          <button
            onClick={handleDeclineOrderRequest}
            className="border border-[#E0E0E0] h-[40px] px-4 w-full"
          >
            Decline Order
          </button>
          <Link
            href={"/gallery/orders/quote"}
            className="w-full grid place-items-center"
          >
            <button
              onClick={routeToQuote}
              className="bg-dark h-[40px] px-4 w-full text-white"
            >
              Provide shipping quote
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
