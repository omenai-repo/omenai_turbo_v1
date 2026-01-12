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
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";

// --- Custom Icon Components for Cleaner JSX ---
const BoxIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const RulerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

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
      toast_notif(
        "All mandatory form fields must be filled out before submission.",
        "error"
      );
      return;
    }
    setLoading(true);
    if (
      Number.isNaN(height) ||
      Number.isNaN(weight) ||
      Number.isNaN(width) ||
      Number.isNaN(length)
    ) {
      toast_notif("Only numerical values are allowed for dimensions", "error");
      return;
    }

    if (exhibition_status !== null && !exhibition_status.exhibition_end_date) {
      toast_notif(
        "Please input the date of the exhibition closure to proceed",
        "error"
      );
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
      csrf || "",
      specialInstructions
    );
    // Accept order request call
    if (!response?.isOk) {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "#ef4444",
          color: "white",
          border: "none",
        },
      });
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "#10b981",
          color: "white",
          border: "none",
        },
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
      <div className="h-[75vh] grid place-items-center bg-gray-50">
        <NotFoundData />
      </div>
    );

  const image_url = getOptimizedImage(
    order_data?.data.artwork_data.url as string,
    "medium",
    90
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-4">
      <div className="">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-900">Order Fulfilment</span>
            <span>/</span>
            <span>Details</span>
          </div>
          <h1 className="text-fluid-2xl font-bold tracking-tight text-gray-900">
            Confirm Logistics
          </h1>
          <p className="mt-2 text-fluid-base text-gray-600 max-w-2xl">
            Please verify the artwork dimensions and provide shipping specifics
            to finalize this order.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Form Section (Left Side - 8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <form onSubmit={handleSubmitQuoteFees} className="space-y-8">
              {/* Dimensions Card */}
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <RulerIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Package Dimensions
                    </h2>
                    <p className="text-xs text-gray-500">
                      Measurements including packaging material
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Input Helper Component */}
                    {[
                      {
                        label: "Length",
                        name: "length",
                        unit: "cm",
                        ph: "0.00",
                      },
                      {
                        label: "Height",
                        name: "height",
                        unit: "cm",
                        ph: "0.00",
                      },
                      { label: "Width", name: "width", unit: "cm", ph: "0.00" },
                      {
                        label: "Weight",
                        name: "weight",
                        unit: "kg",
                        ph: "0.00",
                      },
                    ].map((field) => (
                      <div key={field.name} className="space-y-2 group">
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-gray-700 transition-colors group-focus-within:text-dark"
                        >
                          {field.label}
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <input
                            onChange={handleInputChange}
                            name={field.name}
                            type="number"
                            step="any"
                            placeholder={field.ph}
                            className={INPUT_CLASS}
                            min={0}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <span className="text-gray-400 font-normal sm:text-sm bg-slate-900 px-2 py-1 rounded">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logistics & Pickup */}
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-8 space-y-6">
                <div>
                  <h3 className="text-fluid-sm font-medium text-gray-900 mb-6">
                    Logistics & Availability
                  </h3>
                  <div className="space-y-6">
                    <div className="w-full">
                      <NativeSelect
                        size="md"
                        radius="md"
                        label="Is this piece currently on exhibition?"
                        description="This affects pickup scheduling availability."
                        withAsterisk
                        data={["No", "Yes"]}
                        name="is_exhibition"
                        required
                        classNames={{
                          label:
                            "text-fluid-xxs font-normal text-gray-700 mb-1.5 block",
                          description: "text-xs text-gray-500 mb-3",
                          input:
                            "w-full rounded-xl border-gray-200 py-3 text-gray-700 focus:border-dark focus:ring-dark",
                        }}
                        onChange={(e) =>
                          handleChangeExhibitionStatus(e.target.value)
                        }
                      />
                    </div>

                    {exhibition_status?.is_on_exhibition && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-amber-800 font-medium mb-3">
                          When does the exhibition end?
                        </p>
                        <DateTimePickerComponent
                          handleDateTimeChange={set_exhibition_status}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label
                    htmlFor="specialInstructions"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    onChange={handleInputChange}
                    name="specialInstructions"
                    placeholder="Add pickup notes, gate codes, or handling requirements..."
                    rows={3}
                    className={`${TEXTAREA_CLASS} !rounded-xl !border-gray-200 focus:!border-dark focus:!ring-dark resize-none py-3 px-4 text-sm`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6 pt-2">
                <WarningAlert />

                <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={terms_checked}
                      onChange={() => set_terms_checked(!terms_checked)}
                      className="h-5 w-5 rounded border-gray-600 text-dark focus:ring-dark transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label
                      className="font-medium text-gray-900 cursor-pointer"
                      onClick={() => set_terms_checked(!terms_checked)}
                    >
                      Acknowledge Terms
                    </label>
                    <p className="text-gray-500">
                      I confirm the dimensions provided are accurate including
                      packaging, and the artwork is ready for processing.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !terms_checked ||
                    (exhibition_status !== null &&
                      !exhibition_status.exhibition_end_date)
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-900 px-8 py-4 text-fluid-xs font-normal text-white shadow-lg shadow-gray-900/10 hover:bg-dark/80 hover:shadow-gray-900/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <LoadSmall />
                      <span>Accepting Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Accept & Confirm Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Summary Section (Right Side - 4 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-dark px-6 py-6 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <h3 className="font-medium text-fluid-xs flex items-center gap-2">
                    <BoxIcon className="w-5 h-5 text-white" />
                    Order Summary
                  </h3>
                  <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">
                    #{order_data.data.order_id.slice(-6).toUpperCase()}
                  </span>
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Artwork Preview */}
              <div className="p-6">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-inner mb-6 group">
                  <Image
                    src={image_url}
                    alt={order_data.data.artwork_data.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="cursor-pointer hover:underline absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      target="__blank"
                      href={`${base_url()}/artwork/${order_data.data.artwork_data.art_id}`}
                      className="text-xs font-medium"
                    >
                      View detailed Info
                    </Link>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-fluid-base font-semibold text-gray-900 leading-tight">
                    {order_data.data.artwork_data.title}
                  </h4>
                  <p className="text-gray-500 font-medium text-fluid-xs">
                    {order_data.data.artwork_data.artist}
                  </p>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Artwork Value</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(
                        order_data.data.artwork_data.pricing.usd_price
                      )}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Destination
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {
                          order_data.data.shipping_details.addresses.destination
                            .city
                        }
                        ,{" "}
                        {
                          order_data.data.shipping_details.addresses.destination
                            .country
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Buyer
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {order_data.data.buyer_details.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-100/50">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Status: Awaiting Dimensions
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
