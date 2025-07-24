"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import {
  CreateOrderModelTypes,
  ShipmentDimensions,
} from "@omenai/shared-types";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
import WarningAlert from "./WarningAlert";
import { Checkbox } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function QuoteForm({ order_id }: { order_id: string }) {
  const { csrf } = useAuth({ requiredRole: "artist" });
  const { data: order_data, isLoading } = useQuery({
    queryKey: ["get_single_order"],
    queryFn: async () => {
      const response = await getSingleOrder(order_id);
      if (!response?.isOk)
        throw new Error(
          response?.message || "Order data cannot be retrieved at this time"
        );

      return {
        data: response.data as CreateOrderModelTypes & {
          createdAt: string;
          updatedAt: string;
        },
      };
    },
    refetchOnWindowFocus: false,
  });
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
  const [terms_checked, set_terms_checked] = useState<boolean>(false);

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
      order_data!.data.order_id,
      numerical_dimensions,
      null,
      null,
      csrf || "",
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
      router.replace("/artist/app/orders");
    }
  };
  if (isLoading) return <Load />;
  const image_url = getImageFileView(order_data!.data.artwork_data.url, 200);

  // session.data?.user.
  return (
    // Beautiful Shipping Dimensions Form
    <div className="max-w-full mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-fluid-sm font-semibold text-slate-900">
              Package Dimensions
            </h1>
            <p className="text-slate-600 mt-1 text-fluid-xs">
              Please provide the dimensions of the artwork including packaging
              to calculate accurate shipping costs
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="order-2 lg:order-1">
          <form onSubmit={handleSubmitQuoteFees} className="space-y-6">
            {/* Dimensions Grid */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <h2 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                Package Measurements
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Length Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="length"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Length
                  </label>
                  <div className="relative">
                    <input
                      id="length"
                      name="length"
                      type="number"
                      step="any"
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      cm
                    </span>
                  </div>
                </div>

                {/* Height Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Height
                  </label>
                  <div className="relative">
                    <input
                      id="height"
                      name="height"
                      type="number"
                      step="any"
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      cm
                    </span>
                  </div>
                </div>

                {/* Width Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="width"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Width
                  </label>
                  <div className="relative">
                    <input
                      id="width"
                      name="width"
                      type="number"
                      step="any"
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      cm
                    </span>
                  </div>
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Weight
                  </label>
                  <div className="relative">
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      step="any"
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      kg
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <label
                htmlFor="specialInstructions"
                className="block text-sm font-medium text-slate-700"
              >
                Special Instructions
                <span className="text-slate-500 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                onChange={handleInputChange}
                placeholder="Add any special pickup instructions, handling requirements, or notes..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors resize-none placeholder:text-fluid-xs"
              />
            </div>

            {/* Terms Section */}
            <div className="space-y-4">
              <WarningAlert />

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={terms_checked}
                    onChange={() => set_terms_checked(!terms_checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors">
                    <svg
                      className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">
                  I confirm that I have read and understand the terms associated
                  with accepting this order
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !terms_checked}
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 text-fluid-xs"
            >
              {loading ? (
                <LoadSmall />
              ) : (
                <span className="flex items-center gap-2">
                  Accept Order Request
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Order Details Card */}
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6">
            {/* Card Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                Order Details
              </h3>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Artwork Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src={image_url}
                    alt={order_data!.data.artwork_data.title}
                    height={200}
                    width={200}
                    className="rounded-lg object-cover shadow-md"
                  />
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Artwork
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {order_data?.data.artwork_data.title}
                  </p>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Artist
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {order_data?.data.artwork_data.artist}
                  </p>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Price
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatPrice(
                      order_data!.data.artwork_data.pricing.usd_price
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Buyer
                    </p>
                    <p className="text-base font-medium text-slate-900">
                      {order_data?.data.buyer_details.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Shipping To
                    </p>
                    <p className="text-sm text-slate-700">
                      {
                        order_data?.data.shipping_details.addresses.destination
                          .state
                      }
                      ,{" "}
                      {
                        order_data?.data.shipping_details.addresses.destination
                          .country
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Status Badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Awaiting Dimensions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
