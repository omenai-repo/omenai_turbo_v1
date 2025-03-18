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
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";

export default function QuoteForm() {
  const { galleryOrderActionModalData, clearGalleryOrderActionModalData } =
    actionStore();
  const queryClient = useQueryClient();

  const [quoteData, setQuoteData] = useState<ShippingQuoteTypes>({
    fees: "",
    taxes: "",
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
    if (
      allKeysEmpty({
        fees: quoteData.fees,
        taxes: quoteData.taxes,
      })
    ) {
      toast.error("Error notification", {
        description:
          "All mandatory form fields must be filled out before submission.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
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
          <div className=" flex flex-col space-y-2 w-full">
            <div className="relative w-full flex flex-col space-y-2">
              <label
                className="text-dark font-light text-[14px]"
                htmlFor="shipping"
              >
                Package carrier
              </label>
              <input
                onChange={handleInputChange}
                name="package_carrier"
                type="text"
                placeholder="e.g DHL, USPS, UPS, etc..."
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40 placeholder:text-xs"
              />
            </div>
          </div>
          <div className="flex gap-x-2 items-center">
            <div className="flex flex-col space-y-2 w-full">
              <div className="relative w-full flex flex-col space-y-2">
                <label
                  className="text-dark font-light text-[14px]"
                  htmlFor="shipping"
                >
                  Shipping fees ($)
                </label>
                <input
                  onChange={handleInputChange}
                  name="fees"
                  type="number"
                  step="any"
                  placeholder="e.g 150.00"
                  className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40 placeholder:text-xs"
                />
                <BsCurrencyDollar className="absolute right-3 top-9 text-dark font-light" />
              </div>
            </div>
            <div className="flex flex-col space-y-2 w-full">
              <label
                className="text-dark font-light text-[14px]"
                htmlFor="shipping"
              >
                Taxes and other fees ($)
              </label>
              <div className="relative w-full flex flex-col space-y-2">
                <input
                  onChange={handleInputChange}
                  name="taxes"
                  placeholder="e.g 150.00"
                  type="number"
                  step="any"
                  className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40 placeholder:text-xs"
                />
                <BsCurrencyDollar className="absolute right-3 top-3 text-dark font-light" />
              </div>
            </div>
          </div>

          <div className=" flex flex-col space-y-2 w-full">
            <label
              className="text-dark font-light text-[14px]"
              htmlFor="shipping"
            >
              Additional information (optional)
            </label>
            <div className="relative w-full flex flex-col space-y-2">
              <textarea
                onChange={handleInputChange}
                name="additional_information"
                rows={5}
                className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-dark font-light placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none rounded-[20px]"
              />
            </div>
          </div>
          <div className="w-full mt-5">
            <button
              disabled={loading}
              type="submit"
              className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normalr"
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
                width={100}
                className="object-top h-[100px] w-[100px] rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-light">Artwork name</p>
              <p className="font-semibold">
                {galleryOrderActionModalData.artwork.title}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-light">Artist name</p>
              <p className="font-semibold">
                {galleryOrderActionModalData.artwork.artist}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-light">Price</p>
              <p className="font-semibold">
                {formatPrice(
                  galleryOrderActionModalData.artwork.pricing.usd_price
                )}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-light">Buyer name</p>
              <p className="font-semibold">
                {galleryOrderActionModalData.buyer}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-light">Buyer address</p>
              <p className="font-semibold">
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
