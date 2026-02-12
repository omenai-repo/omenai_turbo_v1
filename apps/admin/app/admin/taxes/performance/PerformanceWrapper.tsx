"use client";
import { RingProgress, Badge } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  Calendar,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  Activity,
  Ban,
} from "lucide-react";
import { canAccessRoute } from "../../../utils/canAccessRoute";
import ForbiddenPage from "../../components/ForbiddenPage";
import { nexus_thresholds } from "@omenai/shared-json/src/us_nexus_states_threshold";
import { notFound, useSearchParams } from "next/navigation";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { useQuery } from "@tanstack/react-query";
import { fetchNexusData } from "@omenai/shared-services/admin/fetch_nexus_data";
import Load from "@omenai/shared-ui-components/components/loader/Load";

// Risk level configuration
const RISK_LEVELS = [
  { threshold: 100, level: "Critical", color: "text-red-600", bg: "bg-red-50" },
  {
    threshold: 80,
    level: "High",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    threshold: 60,
    level: "Medium",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  { threshold: 0, level: "Low", color: "text-green-600", bg: "bg-green-50" },
];

// Progress color thresholds
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "#dc2626";
  if (percentage >= 70) return "#f59e0b";
  return "#10b981";
};

const getRiskLevel = (
  salesPercentage: number,
  transactionPercentage: number,
) => {
  const maxPercentage = Math.max(salesPercentage, transactionPercentage);
  return (
    RISK_LEVELS.find((r) => maxPercentage >= r.threshold) ||
    RISK_LEVELS[RISK_LEVELS.length - 1]
  );
};

// Extracted Components
const NoThresholdMessage = ({
  state,
  type,
}: {
  state: string;
  type: string;
}) => (
  <div className="flex flex-col space-y-2 w-full h-full">
    <div className="mx-auto w-20 h-20 bg-red-100 rounded flex items-center justify-center mb-6">
      <Ban className="w-10 h-10 text-red-600" />
    </div>
    <p className="text-fluid-xxs text-center">
      No {type} requirements for the state of {state}
    </p>
  </div>
);

const ProgressRing = ({
  percentage,
  current,
  threshold,
  isSales,
}: {
  percentage: number;
  current: number;
  threshold: number;
  isSales: boolean;
}) => (
  <div className="flex justify-center mb-6">
    <RingProgress
      size={180}
      thickness={16}
      roundCaps
      sections={[
        {
          value: Math.min(percentage, 100),
          color: isSales ? getProgressColor(percentage) : "#dc2626",
        },
      ]}
      label={
        <div className="text-center">
          <div className="text-fluid-lg font-bold text-gray-900">
            {isSales ? `$${(current / 1000).toFixed(1)}k` : current}
          </div>
          <div className="text-fluid-xxs text-slate-700">
            of {isSales ? `$${(threshold / 1000).toFixed(1)}k` : threshold}
          </div>
        </div>
      }
    />
  </div>
);

const ThresholdStatus = ({
  current,
  threshold,
  isSales,
}: {
  current: number;
  threshold: number;
  isSales: boolean;
}) => {
  const exceeded = current > threshold;
  const difference = Math.abs(current - threshold);

  if (isSales) {
    return exceeded ? (
      <div className="flex justify-between items-center text-fluid-xxs">
        <span className="text-red-500">Exceeded threshold by</span>
        <span className="text-red-500">${difference.toLocaleString()}</span>
      </div>
    ) : (
      <div className="flex justify-between items-center text-fluid-xxs">
        <span className="text-slate-700">Remaining</span>
        <span className="text-gray-700">${difference.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center text-fluid-xxs">
      <span className="text-slate-700">Status</span>
      {exceeded ? (
        <span className="text-red-600 font-medium">
          Exceeded threshold by {difference}
        </span>
      ) : (
        <span className="text-dark font-light">
          Will exceed threshold after {difference} transactions
        </span>
      )}
    </div>
  );
};

const ProgressBar = ({
  percentage,
  isSales,
}: {
  percentage: number;
  isSales: boolean;
}) => (
  <div className="w-full bg-gray-200 rounded h-2">
    <div
      className="h-2 rounded transition-all duration-500"
      style={{
        width: `${Math.min(percentage, 100)}%`,
        backgroundColor: isSales ? getProgressColor(percentage) : "#dc2626",
      }}
    />
  </div>
);

const ProgressSection = ({
  title,
  percentage,
  current,
  threshold,
  state,
  isSales,
}: {
  title: string;
  percentage: number;
  current: number;
  threshold: number | null;
  state: string;
  isSales: boolean;
}) => (
  <div className="relative">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-fluid-xxs font-semibold text-gray-900">{title}</h4>
      <span className="text-fluid-xxs text-slate-700">
        {percentage.toFixed(1)}% of threshold
      </span>
    </div>

    {threshold !== null ? (
      <>
        <ProgressRing
          percentage={percentage}
          current={current}
          threshold={threshold}
          isSales={isSales}
        />
        <div className="space-y-3 text-fluid-xxs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current</span>
            <span
              className={`${isSales ? "font-medium" : "font-semibold"} text-gray-900`}
            >
              {isSales ? `$${current.toLocaleString()}` : current}
            </span>
          </div>
          <ProgressBar percentage={percentage} isSales={isSales} />
          <ThresholdStatus
            current={current}
            threshold={threshold}
            isSales={isSales}
          />
        </div>
      </>
    ) : (
      <NoThresholdMessage
        state={state}
        type={isSales ? "sales" : "transactions"}
      />
    )}
  </div>
);

export const PerformanceWrapper = () => {
  const { user } = useAuth({ requiredRole: "admin" });
  const stateCode = useSearchParams().get("code");

  if (!stateCode) return notFound();

  const thresholds = nexus_thresholds.find(
    (nexus) => nexus.stateCode === stateCode,
  );
  const rules = thresholds?.nexus_rule;

  if (!canAccessRoute(user.access_role, "taxes")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  const { data: nexus_data, isLoading: loading } = useQuery({
    queryKey: ["fetch_nexus_data", stateCode],
    queryFn: async () => {
      const response = await fetchNexusData(stateCode);
      if (!response.isOk)
        throw new Error("Something went wrong, please contact support");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  if (loading) return <Load />;
  if (!nexus_data) return notFound();

  const { calculation, nexus_rule } = nexus_data;
  const salesPercentage = calculation.sales_exposure_percentage;
  const transactionPercentage = calculation.transactions_exposure_percentage;
  const risk = getRiskLevel(salesPercentage, transactionPercentage);
  const hasBreachedNexus =
    salesPercentage >= 100 || transactionPercentage >= 100;

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-4">
          <h1 className="text-fluid-md font-semibold text-gray-900">
            Nexus Tracking
          </h1>
          <p className="text-gray-600 text-fluid-xxs">
            Monitor economic nexus obligations across US states
          </p>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          {/* State Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-fluid-sm 2xl:text-fluid-lg font-semibold text-gray-900">
                  {thresholds?.state}
                </h2>
                <div
                  className={`px-3 py-1 rounded text-fluid-xxs font-medium ${risk.bg} ${risk.color}`}
                >
                  {risk.level} Risk
                </div>
              </div>
              {hasBreachedNexus && (
                <Badge
                  size="sm"
                  radius="md"
                  color="#dc2626"
                  leftSection={<AlertCircle size={16} />}
                >
                  NEXUS BREACHED
                </Badge>
              )}
            </div>
          </div>

          {/* Nexus Rules */}
          <div className="px-8 py-6 bg-gray-50/50">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-fluid-xxs 2xl:text-fluid-xxs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Thresholds
                </h3>
                <div className="space-y-2 text-fluid-xxs">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-dark/70" />
                    <span className="text-gray-700">
                      {formatPrice(nexus_rule.sales_threshold as number)} annual
                      sales
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-dark/70" />
                    <span className="text-gray-700">
                      {nexus_rule.transactions_threshold
                        ? `${nexus_rule.transactions_threshold} transactions`
                        : "No transaction thresholds imposed"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-fluid-xxs 2xl:text-fluid-xxs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Timeline
                </h3>
                <div className="space-y-2 text-fluid-xxs">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-dark/70" />
                    <span className="text-gray-700">
                      Effective:{" "}
                      {rules?.effective_date
                        ? formatIntlDateTime(rules.effective_date)
                        : "Effective date not determined"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-dark/70" />
                    <span className="text-gray-700">
                      Evaluation period:{" "}
                      {nexus_rule.evaluation_period_type || "Period Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-8">
              <ProgressSection
                title="Sales Volume"
                percentage={salesPercentage}
                current={calculation.total_sales}
                threshold={nexus_rule.sales_threshold}
                state={nexus_data.state}
                isSales={true}
              />
              <ProgressSection
                title="Transactions"
                percentage={transactionPercentage}
                current={calculation.total_transactions}
                threshold={nexus_rule.transactions_threshold}
                state={nexus_data.state}
                isSales={false}
              />
            </div>

            {/* Alert Banner */}
            {hasBreachedNexus && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-fluid-xxs">
                    Action Required
                  </p>
                  <p className="text-red-700 text-fluid-xxs mt-1">
                    You have exceeded nexus thresholds in {nexus_data.state}.
                    Register for sales tax collection immediately.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
