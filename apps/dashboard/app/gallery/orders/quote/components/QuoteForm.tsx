"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import {
  CreateOrderModelTypes,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
} from "@omenai/shared-types";
import DateTimePickerComponent from "./DateTimePicker";
import { NativeSelect } from "@mantine/core";
import WarningAlert from "./WarningAlert";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
export default function QuoteForm({ order_id }: { order_id: string }) {
  const { csrf } = useAuth({ requiredRole: "gallery" });

  const queryClient = useQueryClient();

  const { data: order_data, isLoading } = useQuery({
    queryKey: ["get_single_order", order_id],
    queryFn: async () => {
      const response = await getSingleOrder(order_id);
      if (!response?.isOk) return undefined;

      return {
        data: response.data as CreateOrderModelTypes & {
          createdAt: string;
          updatedAt: string;
        },
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!order_id,
  });

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
  const [terms_checked, set_terms_checked] = useState<boolean>(false);
  const [exhibition_status, set_exhibition_status] =
    useState<OrderArtworkExhibitionStatus | null>(null);

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

  function handleChangeExhibitionStatus(value: string) {
    if (value === "No" || value === "Select an option")
      set_exhibition_status(null);
    if (value === "Yes")
      set_exhibition_status({
        is_on_exhibition: true,
        exhibition_end_date: "",
        status: "pending",
      });
    return;
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

    if (exhibition_status !== null && !exhibition_status.exhibition_end_date) {
      toast.error("Error notification", {
        description:
          "Please input the date of the exhibition closure to proceed",
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
      exhibition_status,
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
      router.replace("/gallery/orders");
    }
  };
  if (isLoading) return <Load />;

  if (order_data === undefined)
    return (
      <div className="h-[75vh] grid place-items-center">
        <NotFoundData />
      </div>
    );
  const image_url = getOptimizedImage(
    order_data?.data.artwork_data.url as string,
    "thumbnail",
    40
  );

  // session.data?.user.
  return (
    <div className="max-w-7xl my-4 pb-4">
      {/* Header Section */}
      <div className="bg-white rounded shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded">
            <svg
              className="w-6 h-6 text-dark"
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
            <h1 className="text-fluid-sm font-semibold text-dark">
              Package Details
            </h1>
            <p className="text-slate-600 text-fluid-xxs">
              Please provide accurate dimensions of this piece including
              packaging to calculate shipping costs
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="order-2 lg:order-1">
          <form onSubmit={handleSubmitQuoteFees} className="space-y-6">
            {/* Dimensions Card */}
            <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-dark flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  Measurements of artpiece (With packaging)
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Length */}
                  <div className="space-y-2">
                    <label
                      htmlFor="length"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Length
                    </label>
                    <div className="relative">
                      <input
                        onChange={handleInputChange}
                        name="length"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded text-dark placeholder:text-slate-400 placeholder:text-fluid-xxs focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Height
                    </label>
                    <div className="relative">
                      <input
                        onChange={handleInputChange}
                        name="height"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded text-dark placeholder:text-slate-400 placeholder:text-fluid-xxs focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Width */}
                  <div className="space-y-2">
                    <label
                      htmlFor="width"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Width
                    </label>
                    <div className="relative">
                      <input
                        onChange={handleInputChange}
                        name="width"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded text-dark placeholder:text-slate-400 placeholder:text-fluid-xxs focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Weight
                    </label>
                    <div className="relative">
                      <input
                        onChange={handleInputChange}
                        name="weight"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded text-dark placeholder:text-slate-400 placeholder:text-fluid-xxs focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exhibition Status */}
            <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
              <div className="space-y-4">
                <NativeSelect
                  size="md"
                  radius="md"
                  label="Is this piece currently on exhibition?"
                  withAsterisk
                  data={["No", "Yes"]}
                  name="is_exhibition"
                  required
                  styles={{
                    label: {
                      fontSize: "14px",
                      color: "#334155",
                      marginBottom: "8px",
                      fontWeight: 500,
                    },
                    input: {
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      fontWeight: 400,
                      padding: "",
                    },
                  }}
                  onChange={(e) => handleChangeExhibitionStatus(e.target.value)}
                />

                {exhibition_status?.is_on_exhibition && (
                  <div className="pt-2">
                    <DateTimePickerComponent
                      handleDateTimeChange={set_exhibition_status}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
              <label
                htmlFor="specialInstructions"
                className="block text-sm font-medium text-slate-700 mb-3"
              >
                Special Instructions{" "}
                <span className="text-slate-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                onChange={handleInputChange}
                name="specialInstructions"
                placeholder="Add any special pickup instructions, handling requirements, or access details..."
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded text-dark placeholder:text-slate-400 placeholder:text-fluid-xxs focus:border-dark focus:ring-2 focus:ring-dark focus:outline-none transition-colors resize-none text-fluid-xxs"
              />
            </div>

            {/* Terms & Submit */}
            <div className="space-y-2">
              <WarningAlert />

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={terms_checked}
                    onChange={() => set_terms_checked(!terms_checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:border-dark peer-checked:bg-dark transition-colors">
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

              <button
                type="submit"
                disabled={loading || !terms_checked}
                className="w-full sm:w-auto px-4 py-2 bg-dark mb-4 text-white font-normal text-fluid-xxs rounded shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadSmall />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Accept Order Request
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details Card */}
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-dark flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Order Summary
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Artwork Image */}
              <div className="mb-6">
                <div className="relative rounded overflow-hidden shadow-md p-4 space-y-3">
                  <Image
                    src={image_url}
                    alt={order_data!.data.artwork_data.title}
                    height={200}
                    width={300}
                    className="w-fit h-48 object-cover"
                  />
                  <div className=" bottom-0 left-0 right-0 text-dark/80">
                    <p className=" font-semibold text-fluid-xxs">
                      {order_data?.data.artwork_data.title}
                    </p>
                    <p className="font-medium text-fluid-xxs">
                      {order_data?.data.artwork_data.artist}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Price</span>
                  <span className="font-semibold text-dark">
                    {formatPrice(
                      order_data!.data.artwork_data.pricing.usd_price
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Buyer
                    </p>
                    <p className="font-medium text-dark">
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

                {/* Status Badge */}
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded text-sm font-medium">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Awaiting Dimensions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
