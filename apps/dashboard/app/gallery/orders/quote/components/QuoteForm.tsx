"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useMemo } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";
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
import { TEXTAREA_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

// --- Imported Components ---
import PackagingSelector from "./PackagingSelector";
import OrderSummary from "./OrderSummary";

// --- Icons ---
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

// Helper to safely parse dimension strings (e.g. "32in" -> 32)
const parseDim = (val: string | number | undefined) => {
  if (!val) return 0;
  const str = String(val);
  // Remove everything that is NOT a digit or a decimal point
  const cleanStr = str.replace(/[^\d.]/g, "");
  return Number(cleanStr) || 0;
};

export default function QuoteForm({ order_id }: { order_id: string }) {
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const queryClient = useQueryClient();
  const router = useRouter();

  // 1. Data Fetching
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

  // 2. State Management
  const [packagingType, setPackagingType] = useState<"rolled" | "stretched">(
    "stretched",
  );
  const [package_details, setPackageDetails] = useState({
    height: "",
    weight: "",
    width: "",
    length: "",
  });
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [terms_checked, set_terms_checked] = useState<boolean>(false);
  const [exhibition_status, set_exhibition_status] =
    useState<OrderArtworkExhibitionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const artDims = useMemo(() => {
    const dims = order_data?.data?.artwork_data?.dimensions;
    if (!dims) return { length: 0, height: 0 };

    return {
      // Canvas Length
      length: parseDim(dims.length),
      // Canvas Height
      height: parseDim(dims.height),
      // Note: We deliberately IGNORE depth/width here as discussed
    };
  }, [order_data]);

  // 4. Conditional Returns (Now safe to place here)
  if (isLoading) return <Load />;
  if (order_data === undefined)
    return (
      <div className="h-[75vh] grid place-items-center bg-slate-50">
        <NotFoundData />
      </div>
    );

  // 5. Handlers
  const handleDimensionUpdate = (details: {
    length: string;
    width: string;
    height: string;
    weight: string;
  }) => {
    setPackageDetails(details);
  };

  function handleChangeExhibitionStatus(value: string) {
    if (value === "No" || value === "Select an option")
      set_exhibition_status(null);
    if (value === "Yes") {
      set_exhibition_status({
        is_on_exhibition: true,
        exhibition_end_date: "",
        status: "pending",
      });
    }
  }

  const handleSubmitQuoteFees = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { height, weight, width, length } = package_details;

    if (allKeysEmpty({ height, weight, width, length })) {
      toast_notif(
        "All packaging fields must be filled out before submission.",
        "error",
      );
      return;
    }

    if (exhibition_status !== null && !exhibition_status.exhibition_end_date) {
      toast_notif(
        "Please input the date of the exhibition closure to proceed",
        "error",
      );
      return;
    }

    setLoading(true);

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
      specialInstructions,
    );

    if (!response?.isOk) {
      toast.error("Error notification", {
        description: response?.message,
        style: { background: "#ef4444", color: "white", border: "none" },
      });
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Operation successful", {
        description: response.message,
        style: { background: "#10b981", color: "white", border: "none" },
      });
      queryClient.invalidateQueries({ queryKey: ["fetch_orders_by_category"] });
      router.replace("/gallery/orders");
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden bg-slate-50/50">
      <div className="grid lg:grid-cols-12 h-full">
        {/* LEFT SIDE */}
        <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-fluid-md font-bold tracking-tight text-slate-900">
                Confirm Logistics
              </h1>
              <p className="mt-2 text-fluid-xs text-slate-600">
                Please verify the artwork dimensions, exhibition status, and
                packaging details.
              </p>
            </div>

            <form onSubmit={handleSubmitQuoteFees} className="space-y-8">
              {/* Packaging Selector */}
              <div className="bg-white rounded shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                    <RulerIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Package Dimensions
                    </h2>
                  </div>
                </div>

                <div className="p-2">
                  <PackagingSelector
                    artDimensions={artDims}
                    packagingType={packagingType}
                    onTypeChange={setPackagingType}
                    onUpdate={handleDimensionUpdate}
                  />
                </div>
              </div>

              {/* Exhibition Status */}
              <div className="bg-white rounded shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 space-y-6">
                <div>
                  <h3 className="text-fluid-base font-medium text-slate-900 mb-6">
                    Logistics & Availability
                  </h3>
                  <div className="space-y-6">
                    <div className="w-full">
                      <NativeSelect
                        size="sm" // Adjusted from 'md' to 'sm' for a sleeker profile
                        radius="md"
                        label="Is this piece currently on exhibition?"
                        description="This affects pickup scheduling availability."
                        withAsterisk
                        data={["No", "Yes"]}
                        name="is_exhibition"
                        required
                        classNames={{
                          root: "w-full",
                          label: "text-xs font-semibold text-gray-700 mb-1",
                          description:
                            "text-[11px] text-gray-500 mb-2 leading-tight",
                          input:
                            "text-xs font-light h-[36px] bg-white border-gray-300 text-gray-700 focus:border-0 focus:ring-1 focus:ring-dark shadow-sm cursor-pointer",
                        }}
                        onChange={(e) =>
                          handleChangeExhibitionStatus(e.target.value)
                        }
                      />
                    </div>

                    {exhibition_status?.is_on_exhibition && (
                      <div className="p-4 bg-amber-50 rounded border border-amber-100 animate-in fade-in slide-in-from-top-2">
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

                {/* Special Instructions */}
                <div className="border-t border-slate-100 pt-6">
                  <label
                    htmlFor="specialInstructions"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    name="specialInstructions"
                    placeholder="Add pickup notes, gate codes, or handling requirements..."
                    rows={3}
                    className={`${TEXTAREA_CLASS} !rounded !border-slate-200 focus:!border-dark focus:!ring-dark resize-none py-3 px-4 text-sm`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6 pt-2 px-4 pb-10">
                <WarningAlert />

                <div className="flex items-start gap-3 p-4 rounded border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer bg-white">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={terms_checked}
                      onChange={() => set_terms_checked(!terms_checked)}
                      className="h-5 w-5 rounded border-slate-600 text-dark focus:ring-dark transition-colors cursor-pointer"
                    />
                  </div>
                  <div className=" text-fluid-xs leading-6">
                    <label
                      className="font-medium text-slate-900 cursor-pointer"
                      onClick={() => set_terms_checked(!terms_checked)}
                    >
                      Acknowledge Terms
                    </label>
                    <p className="text-slate-500">
                      I confirm the dimensions provided are accurate, and the
                      artwork is ready for processing.
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
                  className="w-full flex items-center justify-center gap-2 rounded bg-slate-900 px-8 py-4 text-white shadow-lg shadow-slate-900/10 hover:bg-dark/80 hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <LoadSmall />
                      <span>Processing...</span>
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
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-5 xl:col-span-4 h-full border-l border-slate-200 bg-white overflow-hidden relative shadow-xl z-20">
          <div className="w-full h-full p-6 lg:p-8 overflow-y-auto">
            <OrderSummary order_data={order_data.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
