// Updated to accept the new function that calls our dynamic API route
import { getFinancialMetrics } from "@omenai/shared-services/admin/getFinancialMetrics";
import { getAcquisitionMetrics } from "@omenai/shared-services/admin/getAcquisitionMetrics";
import { getOperationalMetrics } from "@omenai/shared-services/admin/getOperationalMetrics";
import { getEngagementMetrics } from "@omenai/shared-services/admin/getEngagementMetrics";
import { useQuery } from "@tanstack/react-query";
import {
  AcquisitionMetricsData,
  ApiResponse,
  EngagementMetricsData,
  FinancialMetricsData,
  OperationalMetricsData,
} from "@omenai/shared-types";

// 1. Accepts the 'year' to power the dashboard toggle
export function useFinancialMetrics(year: string) {
  return useQuery({
    // Adding 'year' to the queryKey ensures React Query caches each year independently!
    queryKey: ["admin-metrics", "financial", year],
    queryFn: async (): Promise<ApiResponse<FinancialMetricsData>> => {
      // Pass the year to your service fetcher
      const response = await getFinancialMetrics(year);
      return response as ApiResponse<FinancialMetricsData>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useAcquisitionMetrics() {
  return useQuery({
    queryKey: ["admin-metrics", "acquisition"],
    queryFn: async (): Promise<ApiResponse<AcquisitionMetricsData>> => {
      const response = await getAcquisitionMetrics();
      return response as ApiResponse<AcquisitionMetricsData>;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useOperationalMetrics() {
  return useQuery({
    queryKey: ["admin-metrics", "operational"],
    queryFn: async (): Promise<ApiResponse<OperationalMetricsData>> => {
      const response = await getOperationalMetrics();
      return response as ApiResponse<OperationalMetricsData>;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useEngagementMetrics() {
  return useQuery({
    queryKey: ["admin-metrics", "engagement"],
    queryFn: async (): Promise<ApiResponse<EngagementMetricsData>> => {
      const response = await getEngagementMetrics();
      return response as ApiResponse<EngagementMetricsData>;
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });
}
