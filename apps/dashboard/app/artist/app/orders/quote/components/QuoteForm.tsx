"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "sonner";
import Image from "next/image";
import { PiSealWarning } from "react-icons/pi";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { ShipmentDimensions } from "@omenai/shared-types";

export default function QuoteForm() {
  const { artistOrderActionModalData, clearArtistOrderActionModalData } =
    artistActionStore();
  const queryClient = useQueryClient();

  const [package_details, setPackageDetails] = useState<{
    height: string;
    weight: string;
    width: string;
    length: string;
    specialInstructions?: string;
  }>({
    height: "",
    weight: "",
    width: "",
    length: "",
    specialInstructions: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setPackageDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const handleSubmitQuoteFees = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { height, weight, width, length, specialInstructions } =
      package_details;
    if (
      allKeysEmpty({
        height,
        weight,
        width,
        length,
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
    if (
      Number.isNaN(height) ||
      Number.isNaN(weight) ||
      Number.isNaN(width) ||
      Number.isNaN(length)
    ) {
      toast.error("Error notification", {
        description: "Only numerical values are allowed for dimensions",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    const numerical_dimensions: ShipmentDimensions = {
      height: Number(height),
      width: Number(width),
      weight: Number(weight),
      length: Number(length),
    };

    const response = await acceptOrderRequest(
      artistOrderActionModalData.order_id,
      numerical_dimensions,
      null,
      null,
      specialInstructions
    );
    // Accept order request call
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
      clearArtistOrderActionModalData();
      router.replace("/artist/app/orders");
    }
  };
  const image_url = getImageFileView(
    artistOrderActionModalData.artwork.url,
    200
  );

  // session.data?.user.
  return (
    <div className="my-5">
      <div className="w-full py-3 bg-white">
        <h1 className="text-base text-gray-700 font-normal">
          Artpiece Dimension (Including packaging)
        </h1>
        <span className="text-xs">
          Kindly provide the dimensions of the piece after packaging so we can
          calculate an accurate shipping cost for it.
        </span>
      </div>

      <div className="grid lg:grid-cols-2 mt-10 gap-5 items-center justify-center">
        <form
          className="w-full flex flex-col gap-y-4"
          onSubmit={handleSubmitQuoteFees}
        >
          <div className=" flex flex-col space-y-5 w-full">
            <div className="relative w-full flex flex-col space-y-2">
              <label
                className="text-gray-700 font-light text-xs"
                htmlFor="shipping"
              >
                Length
              </label>
              <input
                onChange={handleInputChange}
                name="length"
                type="number"
                step="any"
                placeholder="Enter the length after packaging"
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
              />
            </div>
            <div className="relative w-full flex flex-col space-y-2">
              <label
                className="text-gray-700 font-light text-xs"
                htmlFor="shipping"
              >
                Height
              </label>
              <input
                onChange={handleInputChange}
                name="height"
                type="number"
                step="any"
                placeholder="Enter the height after packaging"
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
              />
            </div>
            <div className="relative w-full flex flex-col space-y-2">
              <label
                className="text-gray-700 font-light text-xs"
                htmlFor="shipping"
              >
                Width
              </label>
              <input
                onChange={handleInputChange}
                name="width"
                type="number"
                step="any"
                placeholder="Enter the width after packaging"
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
              />
            </div>
            <div className="relative w-full flex flex-col space-y-2">
              <label
                className="text-gray-700 font-light text-xs"
                htmlFor="shipping"
              >
                Weight
              </label>
              <input
                onChange={handleInputChange}
                name="weight"
                type="number"
                step="any"
                placeholder="Enter the weight after packaging"
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
              />
            </div>
          </div>

          <div className=" flex flex-col space-y-2 mt-5 w-full">
            <label
              className="text-gray-700 font-light text-xs"
              htmlFor="shipping"
            >
              Special instructions (optional)
            </label>
            <div className="relative w-full flex flex-col space-y-2">
              <textarea
                onChange={handleInputChange}
                name="specialInstructions"
                placeholder="Enter any special instructions for picking up the piece (e.g., Ring the doorbell)."
                rows={5}
                className="p-3 border border-[#E0E0E0] text-xs placeholder:text-gray-700 font-light placeholder:text-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none rounded-[20px]"
              />
            </div>
          </div>
          <div className="w-full mt-5">
            <button
              disabled={loading}
              type="submit"
              className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-xs font-normalr"
            >
              {loading ? <LoadSmall /> : " Accept order request"}
            </button>
          </div>
        </form>
        {/* Details */}
        <div className="p-3 border border-[#E0E0E0] text-xs rounded-lg">
          <div className="flex flex-col gap-y-4 text-xs">
            <div className="flex flex-col">
              <Image
                src={image_url}
                alt={artistOrderActionModalData.artwork.title}
                height={100}
                width={100}
                className="object-top h-[100px] w-[100px] rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 font-light">Artwork name</p>
              <p className="font-semibold">
                {artistOrderActionModalData.artwork.title}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 font-light">Artist name</p>
              <p className="font-semibold">
                {artistOrderActionModalData.artwork.artist}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 font-light">Price</p>
              <p className="font-semibold">
                {formatPrice(
                  artistOrderActionModalData.artwork.pricing.usd_price
                )}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 font-light">Buyer name</p>
              <p className="font-semibold">
                {artistOrderActionModalData.buyer}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 font-light">Buyer address</p>
              <p className="font-semibold">
                {artistOrderActionModalData.shipping_address.state},
                {artistOrderActionModalData.shipping_address.country},
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
