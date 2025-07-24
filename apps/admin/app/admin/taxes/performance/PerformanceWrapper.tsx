"use client";
import {
  RingProgress,
  Progress,
  ThemeIcon,
  Paper,
  Badge,
  Tooltip,
  SegmentedControl,
} from "@mantine/core";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BanknoteArrowUp,
  Calendar,
  Check,
  CircleAlert,
  Info,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

// Beautiful US Nexus Tracking Dashboard
export const PerformanceWrapper = () => {
  // Sample data for the trend chart
  const trendData = [
    { month: "Jan", sales: 12000, transactions: 145 },
    { month: "Feb", sales: 15000, transactions: 189 },
    { month: "Mar", sales: 18500, transactions: 223 },
    { month: "Apr", sales: 22000, transactions: 267 },
    { month: "May", sales: 25500, transactions: 298 },
    { month: "Jun", sales: 28700, transactions: 334 },
  ];

  const currentSales = 28700;
  const salesThreshold = 32455;
  const currentTransactions = 334;
  const transactionThreshold = 200;
  const salesPercentage = (currentSales / salesThreshold) * 100;
  const transactionPercentage =
    (currentTransactions / transactionThreshold) * 100;

  return (
    <div className="min-h-screen my-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-dark">
                Nexus Tracking Dashboard
              </h1>
              <p className="text-dark mt-1">
                Monitor your economic nexus obligations across US states
              </p>
            </div>
          </div>
        </div>

        {/* State Overview Card */}
        <Paper
          radius="lg"
          my={"lg"}
          className="bg-[#1a1a1a] border border-gray-800"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-dark">Alabama</h2>
                <Badge
                  size="lg"
                  radius="md"
                  className={
                    salesPercentage >= 100 || transactionPercentage >= 100
                      ? "bg-red-500"
                      : "bg-green-500"
                  }
                >
                  {salesPercentage >= 100 || transactionPercentage >= 100
                    ? "NEXUS REACHED"
                    : "SAFE"}
                </Badge>
              </div>
              {/* <p className="text-dark">
                Remote seller nexus thresholds and current performance
              </p> */}

              <div className="flex items-center gap-x-3">
                <p className="text-dark text-sm">
                  Risk Level:{" "}
                  <span className="text-md font-bold text-red-500 mt-1">
                    High
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Nexus Rules Section */}
          <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CircleAlert
                size={20}
                color="#c27803"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              Alabama Nexus Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-2">Economic Nexus Threshold:</p>
                <ul className="space-y-1 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    $250,000 in annual sales, OR
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    200 separate transactions
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Important Dates:</p>
                <ul className="space-y-1 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Calendar
                      size={20}
                      color="#6b7280"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                    Effective: October 1, 2018
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar
                      size={20}
                      color="#6b7280"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                    Measurement Period: Current calendar year
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sales Progress */}
            <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BanknoteArrowUp
                    size={20}
                    color="#f4f4f4"
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                  />
                  <h4 className="text-white font-medium">Sales Volume</h4>
                </div>
                <Tooltip label="Percentage of threshold reached">
                  <Badge size="sm" className="bg-[#2a2a2a] text-gray-300">
                    {salesPercentage.toFixed(1)}%
                  </Badge>
                </Tooltip>
              </div>

              <div className="flex items-center justify-center mb-4">
                <RingProgress
                  size={140}
                  thickness={12}
                  roundCaps
                  sections={[
                    {
                      value: salesPercentage,
                      color:
                        salesPercentage >= 90
                          ? "#ef4444"
                          : salesPercentage >= 70
                            ? "#f59e0b"
                            : "#10b981",
                    },
                  ]}
                  label={
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        ${(currentSales / 1000).toFixed(1)}k
                      </div>
                      <div className="text-xs text-gray-400">of $250k</div>
                    </div>
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Sales</span>
                  <span className="text-white font-medium">
                    ${currentSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threshold</span>
                  <span className="text-gray-300">$250,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-yellow-500 font-medium">
                    ${(250000 - currentSales).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions Progress */}
            <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart
                    size={20}
                    color="#f4f4f4"
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                  />
                  <h4 className="text-white font-medium">Transaction Count</h4>
                </div>
                <Tooltip label="Percentage of threshold reached">
                  <Badge size="sm" className="bg-[#2a2a2a] text-gray-300">
                    {transactionPercentage.toFixed(1)}%
                  </Badge>
                </Tooltip>
              </div>

              <div className="flex items-center justify-center mb-4">
                <RingProgress
                  size={140}
                  thickness={12}
                  roundCaps
                  sections={[
                    {
                      value: transactionPercentage,
                      color:
                        transactionPercentage >= 90
                          ? "#ef4444"
                          : transactionPercentage >= 70
                            ? "#f59e0b"
                            : "#10b981",
                    },
                  ]}
                  label={
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {currentTransactions}
                      </div>
                      <div className="text-xs text-gray-400">of 200</div>
                    </div>
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Count</span>
                  <span className="text-white font-medium">
                    {currentTransactions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threshold</span>
                  <span className="text-gray-300">200 transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-red-500 font-medium">
                    Exceeded by {currentTransactions - 200}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};
