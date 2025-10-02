"use client";
import { listEditorials } from "@omenai/shared-lib/editorials/getEditorials";
import { useQuery } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
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
  if (isLoading) return <Load />;

  const editorials = Array.isArray(data) ? data : [];
  if (editorials && editorials.length === 0)
    return (
      <div>
        <p>No editorials uploaded</p>
      </div>
    );

  return (
    <div className="flex flex-col space-y-6 pb-10">
      <h1 className="text-fluid-xl font-semibold">Editorials</h1>
      <div className="flex gap-4 flex-wrap">
        {editorials?.map((editorial: any) => {
          return (
            <>
              <EditorialItemCard key={editorial.slug} editorial={editorial} />
              <EditorialItemCard key={editorial.slug} editorial={editorial} />
              <EditorialItemCard key={editorial.slug} editorial={editorial} />
            </>
          );
        })}
      </div>
    </div>
  );
}
