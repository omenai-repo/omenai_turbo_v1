"use client";
import { RingProgress, Paper, Badge, Tooltip } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {
  TrendingUp,
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
export const PerformanceWrapper = () => {
  const { user } = useAuth({ requiredRole: "admin" });

  const stateCode = useSearchParams().get("code");

  if (!stateCode) return notFound();

  const thresholds = nexus_thresholds.find(
    (nexus) => nexus.stateCode === stateCode
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

  const currentSales = calculation.total_sales;
  const salesThreshold = nexus_rule.sales_threshold;
  const currentTransactions = calculation.total_transactions;
  const transactionThreshold = nexus_rule.transactions_threshold;
  const salesPercentage = calculation.sales_exposure_percentage;
  const transactionPercentage = calculation.transactions_exposure_percentage;

  const getRiskLevel = () => {
    if (salesPercentage >= 100 || transactionPercentage >= 100)
      return { level: "Critical", color: "text-red-600", bg: "bg-red-50" };
    if (salesPercentage >= 80 || transactionPercentage >= 80)
      return { level: "High", color: "text-orange-600", bg: "bg-orange-50" };
    if (salesPercentage >= 60 || transactionPercentage >= 60)
      return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "Low", color: "text-green-600", bg: "bg-green-50" };
  };

  const risk = getRiskLevel();

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-fluid-md font-semibold text-gray-900">
            Nexus Tracking
          </h1>
          <p className="text-gray-600 text-fluid-xs">
            Monitor economic nexus obligations across US states
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          {/* State Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-fluid-sm 2xl:text-fluid-lg font-semibold text-gray-900">
                  {thresholds?.state}
                </h2>
                <div
                  className={`px-3 py-1 rounded-full text-fluid-xs font-medium ${risk.bg} ${risk.color}`}
                >
                  {risk.level} Risk
                </div>
              </div>
              {(salesPercentage >= 100 || transactionPercentage >= 100) && (
                <Badge
                  size="lg"
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
                <h3 className="text-fluid-xs 2xl:text-fluid-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Thresholds
                </h3>
                <div className="space-y-2 text-fluid-xs">
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
                <h3 className="text-fluid-xs 2xl:text-fluid-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Timeline
                </h3>
                <div className="space-y-2 text-fluid-xs">
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
                      {nexus_rule.evaluation_period_type
                        ? nexus_rule.evaluation_period_type
                        : "Period Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sales Progress */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-fluid-xs font-semibold text-gray-900">
                    Sales Volume
                  </h4>
                  <span className="text-fluid-xs text-gray-500">
                    {salesPercentage.toFixed(1)}% of threshold
                  </span>
                </div>

                {salesThreshold !== null ? (
                  <>
                    <div className="flex justify-center mb-6">
                      <RingProgress
                        size={180}
                        thickness={16}
                        roundCaps
                        sections={[
                          {
                            value: salesPercentage,
                            color:
                              salesPercentage >= 90
                                ? "#dc2626"
                                : salesPercentage >= 70
                                  ? "#f59e0b"
                                  : "#10b981",
                          },
                        ]}
                        label={
                          <div className="text-center">
                            <div className="text-fluid-lg font-bold text-gray-900">
                              ${(currentSales / 1000).toFixed(1)}k
                            </div>
                            <div className="text-fluid-xs text-gray-500">
                              of ${(salesThreshold / 1000).toFixed(1)}k
                            </div>
                          </div>
                        }
                      />
                    </div>
                    <div className="space-y-3 text-fluid-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current</span>
                        <span className="font-medium text-gray-900">
                          ${currentSales.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(salesPercentage, 100)}%`,
                            backgroundColor:
                              salesPercentage >= 90
                                ? "#dc2626"
                                : salesPercentage >= 70
                                  ? "#f59e0b"
                                  : "#10b981",
                          }}
                        />
                      </div>
                      {currentSales > salesThreshold ? (
                        <div className="flex justify-between items-center text-fluid-xs">
                          <span className="text-red-500">
                            Exceeded threshold by
                          </span>
                          <span className="text-red-500">
                            ${(currentSales - salesThreshold).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-fluid-xs">
                          <span className="text-gray-500">Remaining</span>
                          <span className="text-gray-700">
                            ${(salesThreshold - currentSales).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>{" "}
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 w-full h-full">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <Ban className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-fluid-xs text-center">
                      No sales requirements for the state of {nexus_data.state}
                    </p>
                  </div>
                )}
              </div>

              {/* Transactions Progress */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-fluid-xs font-semibold text-gray-900">
                    Transactions
                  </h4>
                  <span className="text-fluid-xs text-gray-500">
                    {transactionPercentage.toFixed(1)}% of threshold
                  </span>
                </div>

                {transactionThreshold !== null ? (
                  <>
                    <div className="flex justify-center mb-6">
                      <RingProgress
                        size={180}
                        thickness={16}
                        roundCaps
                        sections={[
                          {
                            value: Math.min(transactionPercentage, 100),
                            color: "#dc2626",
                          },
                        ]}
                        label={
                          <div className="text-center">
                            <div className="text-fluid-lg font-bold text-gray-900">
                              {currentTransactions}
                            </div>
                            <div className="text-fluid-xs text-gray-500">
                              of {transactionThreshold}
                            </div>
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-3 text-fluid-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current</span>
                        <span className="font-semibold text-gray-900">
                          {currentTransactions}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-600 transition-all duration-500"
                          style={{
                            width: `${Math.min(transactionPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-fluid-xs">
                        <span className="text-gray-500">Status</span>
                        {currentTransactions > transactionThreshold ? (
                          <span className="text-red-600 font-medium">
                            Exceeded threshold by{" "}
                            {currentTransactions - transactionThreshold}
                          </span>
                        ) : (
                          <span className="text-dark font-normal">
                            Will exceed threshold after{" "}
                            {transactionThreshold - currentTransactions}{" "}
                            transactions
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 w-full h-full">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <Ban className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-fluid-xs text-center">
                      No transactions requirements for the state of{" "}
                      {nexus_data.state}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alert Banner */}
            {(salesPercentage >= 100 || transactionPercentage >= 100) && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-fluid-xs">
                    Action Required
                  </p>
                  <p className="text-red-700 text-fluid-xs mt-1">
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
