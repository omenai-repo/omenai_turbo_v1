"use client";
import { listEditorials } from "@omenai/shared-lib/editorials/getEditorials";
import { useQuery } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { EditorialSkeleton } from "@omenai/shared-ui-components/components/skeletons/EditorialSkeleton";
import ArticleCard from "./components/ArticleCard";
import EditorialItemCard from "@omenai/shared-ui-components/components/editorials/EditorialItemCard";
export default function ArticleWrapper() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["fetch_admin_editorials"],
    queryFn: async () => {
      const response = await listEditorials();

      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial list, please refresh or contact IT support",
          "error"
        );

        return [];
      }

      return response.data;
    },
    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });
  if (isLoading) return <EditorialSkeleton />;

  const editorials = Array.isArray(data) ? data : [];
  if (editorials && editorials.length === 0)
    return (
      <div>
        <p>No editorials uploaded</p>
      </div>
    );

  return (
    <div className="min-h-screen pb-5">
      {/* --- Enterprise-Grade Hero/Header Section --- */}
      <header className="max-w-full mx-auto mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-fluid-2xl font-extrabold tracking-tight text-slate-900 mb-4">
          The OMENAI Editorial
        </h1>
        <p className="text-fluid-base text-slate-600 max-w-3xl">
          Dive into our curated collection of insights on art, digital
          ownership, and the future of human-AI collaboration in creativity.
        </p>
      </header>

      {/* --- Main Content and Grid --- */}
      <div className="max-w-full mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Section Title (Moved below the hero) */}
          <h2 className="text-fluid-xl font-semibold text-slate-800">
            Latest Publications
          </h2>

          {/* Editorial Grid: Responsive and professional gap spacing */}
          <div className="flex gap-8 flex-wrap justify-start">
            {editorials?.map((editorial) => {
              return (
                <EditorialItemCard key={editorial.slug} editorial={editorial} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
