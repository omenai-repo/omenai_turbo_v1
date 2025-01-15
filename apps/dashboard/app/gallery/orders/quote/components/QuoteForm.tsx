"use client";

import { updateShippingQuote } from "@omenai/shared-services/orders/updateShippingQuote";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "sonner";
import Image from "next/image";
import { PiSealWarning } from "react-icons/pi";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { ShippingQuoteTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

export default function QuoteForm() {
  const { galleryOrderActionModalData, clearGalleryOrderActionModalData } =
    actionStore();
  const queryClient = useQueryClient();

  const [quoteData, setQuoteData] = useState<ShippingQuoteTypes>({
    package_carrier: "",
    fees: "",
    taxes: "",
    additional_information: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setQuoteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const handleSubmitQuoteFees = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const response = await updateShippingQuote(
      quoteData,
      galleryOrderActionModalData.order_id
    );
    if (!response?.isOk) {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch_orders_by_category"],
      });
      clearGalleryOrderActionModalData();
      router.replace("/gallery/orders");
    }
  };
  const image_url = getImageFileView(
    galleryOrderActionModalData.artwork.url,
    200
  );

  const session = useSession();
  // session.data?.user.
  return (
    <div className="my-5">
      <div className="w-full py-3 px-4 bg-white">
        <h1 className="text-base text-dark font-normal">
          Provide shipping quote
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 mt-10 gap-5 items-center justify-center">
        <form
          className="w-full flex flex-col gap-y-4"
          onSubmit={handleSubmitQuoteFees}
        >
          <div className=" flex flex-col w-full">
            <div className="relative w-full ">
              <label className="text-[#858585] text-[14px]" htmlFor="shipping">
                Package carrier
              </label>
              <input
                onChange={handleInputChange}
                name="package_carrier"
                type="text"
                required
                placeholder="e.g DHL, USPS, UPS, etc..."
                className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-x-2 items-center">
            <div className="flex flex-col w-full">
              <div className="relative w-full ">
                <label
                  className="text-[#858585] text-[14px]"
                  htmlFor="shipping"
                >
                  Shipping fees ($)
                </label>
                <input
                  onChange={handleInputChange}
                  name="fees"
                  type="text"
                  required
                  className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
                />
                <BsCurrencyDollar className="absolute right-3 top-9 text-[#858585]" />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="text-[#858585] text-[14px]" htmlFor="shipping">
                Taxes and other fees ($)
              </label>
              <div className="relative w-full ">
                <input
                  onChange={handleInputChange}
                  name="taxes"
                  type="text"
                  required
                  className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
                />
                <BsCurrencyDollar className="absolute right-3 top-3 text-[#858585]" />
              </div>
            </div>
          </div>

          <div className=" flex flex-col w-full">
            <label className="text-[#858585] text-[14px]" htmlFor="shipping">
              Additional information (optional)
            </label>
            <div className="relative w-full ">
              <textarea
                onChange={handleInputChange}
                name="additional_information"
                rows={5}
                className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
              />
            </div>
          </div>
          <div className="w-full mt-5">
            <button
              disabled={loading}
              type="submit"
              className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-[14px] bg-dark duration-200 grid place-items-center"
            >
              {loading ? <LoadSmall /> : " Accept order request"}
            </button>
          </div>
        </form>
        {/* Details */}
        <div className="p-3 border border-[#E0E0E0] text-[14px] rounded-lg">
          <div className="flex flex-col gap-y-4 text-[14px]">
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
                {galleryOrderActionModalData.shipping_address.address_line},
                {galleryOrderActionModalData.shipping_address.city},
                {galleryOrderActionModalData.shipping_address.state},
                {galleryOrderActionModalData.shipping_address.country},
                {galleryOrderActionModalData.shipping_address.zip}
              </p>
            </div>

            <div className="bg-green-100 p-3 font-normal rounded-md flex items-center gap-x-2">
              <PiSealWarning />
              <p>
                Please confirm buyer&apos;s shipping address before providing
                quote
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
