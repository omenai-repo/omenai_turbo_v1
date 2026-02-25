"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";
import { notFound, useRouter } from "next/navigation";
import { useState, FormEvent, useMemo } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Load from "@omenai/shared-ui-components/components/loader/Load";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import {
  CreateOrderModelTypes,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
} from "@omenai/shared-types";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

// --- Imported Sub-Components ---
import PackagingSelector from "./PackagingSelector";
import OrderSummary from "./OrderSummary";
import CarrierInterventionCard from "./CarrierInterventionCard";
import ExhibitionStatusSection from "./ExhibhitionStatusSection";
import TermsAndSubmitSection from "./TermsAndSubmitSection";

// --- Utilities ---
import {
  checkCarrierLimit,
  checkIfRolledPassesLimit,
} from "@omenai/shared-utils/src/shippingLimits"; // IMPORT MATH

// Icon for the section header
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

const parseDim = (val: string | number | undefined) => {
  if (!val) return 0;
  const str = String(val);
  const cleanStr = str.replace(/[^\d.]/g, "");
  return Number(cleanStr) || 0;
};

export default function QuoteForm({ order_id }: { order_id: string }) {
  const { data: order_data, isLoading } = useQuery({
    queryKey: ["get_single_order", order_id],
    queryFn: async () => {
      const response = await getSingleOrder(order_id);
      return response?.isOk
        ? { data: response.data as CreateOrderModelTypes }
        : undefined;
    },
    enabled: !!order_id,
  });

  // 1. Handle Loading
  if (isLoading) return <Load />;

  // 2. Handle Not Found
  if (!order_data) return <NotFoundData />;

  // 3. Render the actual form, passing the GUARANTEED data
  return <QuoteFormContent order_id={order_id} order_data={order_data.data} />;
}

function QuoteFormContent({
  order_id,
  order_data,
}: {
  order_id: string;
  order_data: CreateOrderModelTypes;
}) {
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const queryClient = useQueryClient();
  const router = useRouter();

  const packaging_type_from_order = order_data.artwork_data.packaging_type;
  const initial_packaging_type =
    packaging_type_from_order === "rolled" ||
    packaging_type_from_order === "stretched"
      ? packaging_type_from_order
      : "rolled"; // Default to "rolled" if the value from the order is invalid
  // 2. State Management
  const [packagingType, setPackagingType] = useState<"rolled" | "stretched">(
    initial_packaging_type,
  );
  const [package_details, setPackageDetails] = useState({
    height: "",
    weight: "",
    width: "",
    length: "",
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [terms_checked, set_terms_checked] = useState(false);
  const [exhibition_status, set_exhibition_status] =
    useState<OrderArtworkExhibitionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Intervention States
  const [hasDeclinedRolled, setHasDeclinedRolled] = useState(false);
  const [forceCustomToggle, setForceCustomToggle] = useState(0);

  // 3. Computed Values & Math
  const artDims = useMemo(() => {
    const dims = order_data.artwork_data?.dimensions;
    if (!dims) return { length: 0, height: 0 };

    // We MUST use parseDim to strip letters and get the real numbers
    return {
      length: parseDim(dims.width),
      height: parseDim(dims.height),
    };
  }, [order_data]);

  const carrier =
    order_data.shipping_details?.shipment_information?.carrier?.toUpperCase() ||
    "";

  // UNIVERSAL LIMIT CHECK
  const isCurrentlyOversized = useMemo(() => {
    if (!carrier) return false;

    // Fallback: If custom fields are blank, check inherent canvas size (using standard depth of 5cm)
    if (
      !package_details.length ||
      !package_details.width ||
      !package_details.height
    ) {
      return checkCarrierLimit(
        artDims.length * 2.54,
        artDims.height * 2.54,
        5,
        10,
        carrier,
      );
    }

    return checkCarrierLimit(
      Number(package_details.length),
      Number(package_details.width),
      Number(package_details.height),
      Number(package_details.weight || 0),
      carrier,
    );
  }, [carrier, package_details, artDims]);

  // LOOKAHEAD CHECK: Does rolling it actually solve the problem?
  const canBeRolled = useMemo(() => {
    return checkIfRolledPassesLimit(
      artDims.length * 2.54,
      artDims.height * 2.54,
      carrier,
    );
  }, [artDims, carrier]);

  // Submit Button Lock Logic
  const isSubmitDisabled =
    loading ||
    !terms_checked ||
    (exhibition_status !== null && !exhibition_status.exhibition_end_date);

  // 4. Handlers
  const handleSubmitQuoteFees = async (e: FormEvent) => {
    e.preventDefault();
    if (allKeysEmpty(package_details)) {
      toast_notif(
        "All packaging dimensions must be provided before submission.",
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
      height: Number(package_details.height),
      width: Number(package_details.width),
      weight: Number(package_details.weight),
      length: Number(package_details.length),
    };

    const response = await acceptOrderRequest(
      order_data.order_id,
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
    } else {
      toast.success("Operation successful", {
        description: response.message,
        style: { background: "#10b981", color: "white", border: "none" },
      });
      queryClient.invalidateQueries({ queryKey: ["fetch_orders_by_category"] });
      router.replace("/gallery/orders");
    }
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden bg-slate-50/50">
      <div className="grid lg:grid-cols-12 h-full">
        {/* LEFT SIDE */}
        <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8">
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

              <div className="p-4 md:p-6">
                <PackagingSelector
                  artDimensions={artDims}
                  packagingType={packagingType}
                  carrier={carrier}
                  forceCustomToggle={forceCustomToggle}
                  packagingTypeFromOrder={packaging_type_from_order}
                  onTypeChange={setPackagingType}
                  onUpdate={(details) => {
                    setPackageDetails(details);
                    setHasDeclinedRolled(false);
                  }}
                />
              </div>
            </div>

            {isCurrentlyOversized || hasDeclinedRolled ? (
              // ROUTE A: Size limits failed. Show the Intervention Card.
              <CarrierInterventionCard
                orderId={order_id}
                carrier={carrier}
                hasDeclined={hasDeclinedRolled}
                canBeRolled={canBeRolled}
                onDecline={() => setHasDeclinedRolled(true)}
                onSwitchToRolled={() => {
                  setPackagingType("rolled");
                  setHasDeclinedRolled(false);
                }}
                onTryCustomCrate={() =>
                  setForceCustomToggle((prev) => prev + 1)
                }
              />
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ExhibitionStatusSection
                  exhibitionStatus={exhibition_status}
                  onStatusChange={set_exhibition_status}
                  specialInstructions={specialInstructions}
                  onInstructionsChange={setSpecialInstructions}
                />

                <TermsAndSubmitSection
                  termsChecked={terms_checked}
                  onTermsChange={set_terms_checked}
                  loading={loading}
                  isDisabled={isSubmitDisabled}
                />
              </div>
            )}
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-5 xl:col-span-4 h-full border-l border-slate-200 bg-white overflow-hidden relative shadow-xl z-20">
          <div className="w-full h-full p-6 lg:p-8 overflow-y-auto">
            <OrderSummary order_data={order_data} />
          </div>
        </div>
      </div>
    </div>
  );
}
