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
  ShipmentDimensions,
  CreateOrderModelTypes,
} from "@omenai/shared-types";
import WarningAlert from "./WarningAlert";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  BUTTON_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

// Components
import PackagingSelector from "./PackagingSelector";
import OrderSummary from "./OrderSummary";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

// Icons
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
  const { csrf } = useAuth({ requiredRole: "artist" });
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch Order Data
  const { data: order_data, isLoading } = useQuery({
    queryKey: ["get_single_order"],
    queryFn: async () => {
      const response = await getSingleOrder(order_id);
      if (!response?.isOk)
        throw new Error(response?.message || "Order retrieval failed");
      return {
        data: response.data as CreateOrderModelTypes & {
          createdAt: string;
          updatedAt: string;
        },
      };
    },
    refetchOnWindowFocus: false,
  });

  // 2. State
  const [packagingType, setPackagingType] = useState<"rolled" | "stretched">(
    order_data?.data.artwork_data.packaging_type || "rolled",
  );
  const [package_details, setPackageDetails] = useState({
    height: "",
    weight: "",
    width: "",
    length: "",
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [terms_checked, set_terms_checked] = useState(false);

  // Inside QuoteForm.tsx

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
  // 3. Handlers
  const handleDimensionUpdate = (details: {
    length: string;
    width: string;
    height: string;
    weight: string;
  }) => {
    setPackageDetails(details);
  };

  const handleSubmitQuoteFees = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { height, weight, width, length } = package_details;

    if (allKeysEmpty({ height, weight, width, length })) {
      toast.error("Required Field", {
        description: "Please select a packaging option.",
        style: { background: "red", color: "white" },
      });
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
      null,
      csrf || "",
      specialInstructions,
    );

    if (!response?.isOk) {
      toast.error("Error", {
        description: response?.message,
        style: { background: "red", color: "white" },
      });
      setLoading(false);
    } else {
      toast.success("Success", {
        description: response.message,
        style: { background: "green", color: "white" },
      });
      queryClient.invalidateQueries({ queryKey: ["fetch_orders_by_category"] });
      router.replace("/artist/app/orders");
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden bg-slate-50/50">
      <div className="grid lg:grid-cols-12 h-full">
        {/* LEFT SIDE: SCROLLABLE FORM */}
        <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto custom-scrollbar">
          <div className="py-4 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-fluid-lg font-bold tracking-tight text-slate-900">
                Confirm Logistics
              </h1>
              <p className="mt-2 text-fluid-xs text-slate-600">
                Select the appropriate packaging to calculate accurate shipping
                rates.
              </p>
            </div>

            <form onSubmit={handleSubmitQuoteFees} className="space-y-8">
              {/* Packaging Selector */}
              <div className="bg-white rounded shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                    <RulerIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Packaging Selection
                    </h2>
                    <p className="text-xs text-slate-500">
                      Choose a preset based on artwork size
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  <PackagingSelector
                    artDimensions={artDims}
                    packagingType={packagingType}
                    onTypeChange={setPackagingType}
                    onUpdate={handleDimensionUpdate}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add pickup notes, gate codes, or handling requirements..."
                  rows={3}
                  className={`${TEXTAREA_CLASS} !rounded !border-slate-200 focus:!border-dark focus:!ring-dark resize-none py-3 px-4 text-sm`}
                />
              </div>

              {/* Actions */}
              <div className="space-y-6 pt-2 px-4 pb-10">
                {order_data.data.artwork_data.exclusivity_status
                  .exclusivity_type === "non-exclusive" && <WarningAlert />}

                <div
                  onClick={() => set_terms_checked(!terms_checked)}
                  className="flex items-start gap-3 p-4 rounded border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                >
                  <input
                    type="checkbox"
                    checked={terms_checked}
                    readOnly
                    className="mt-1 h-5 w-5 rounded border-slate-600 text-dark focus:ring-dark cursor-pointer"
                  />
                  <div className="text-sm leading-6">
                    <span className="font-medium text-slate-900">
                      Acknowledge Terms
                    </span>
                    <p className="text-slate-500">
                      I confirm the selected packaging is sufficient and ready
                      for pickup.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !terms_checked}
                  className={BUTTON_CLASS}
                >
                  {loading ? <LoadSmall /> : <CheckIcon className="w-5 h-5" />}
                  <span>
                    {loading ? "Processing..." : "Confirm & Accept request"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 h-full border-l border-slate-200 bg-white overflow-hidden relative shadow-xl z-20">
          <div className="w-full h-full p-6 lg:p-8 overflow-y-auto">
            <OrderSummary order_data={order_data.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
