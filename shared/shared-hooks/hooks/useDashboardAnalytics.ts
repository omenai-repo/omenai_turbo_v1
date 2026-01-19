import { fetchDashboardAnalytics } from "@omenai/shared-services/admin/fetch_dashboard_analytics";
import { useQuery } from "@tanstack/react-query";

export interface ChartDataPoint {
  _id: string;
  count: number;
}

export interface StrategySuggestion {
  type: "success" | "warning" | "insight";
  title: string;
  message: string;
}

export interface DashboardStats {
  overview: { leads: number; visits: number; conversion: string };
  split: ChartDataPoint[];
  artists: {
    education: ChartDataPoint[];
    experience: ChartDataPoint[];
  };
  collectors: {
    frequency: ChartDataPoint[];
    type: ChartDataPoint[];
    years: ChartDataPoint[];
  };
  geo: ChartDataPoint[];
  traffic: { source: string; medium: string; count: number }[];
  recent: Array<{
    _id: string;
    name: string;
    entity: "artist" | "collector";
    country: string;
    createdAt: string;
    marketing?: { source: string };
  }>;
}

const fetchDashboardStats = async () => {
  const res = await fetchDashboardAnalytics();
  if (!res.isOk || !res.stats || !res.suggestions) {
    throw new Error("Failed to fetch dashboard analytics");
  }
  return res;
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ["admin-dashboard-full"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 30, // 30s cache
    refetchInterval: 1000 * 60, // Background refresh every minute
  });
};
