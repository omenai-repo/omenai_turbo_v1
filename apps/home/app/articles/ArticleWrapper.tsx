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
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnReconnect: "always", // Always refetch when reconnecting
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
    <div className="flex flex-col space-y-6">
      <h1 className="text-fluid-xl font-semibold">Editorials</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {editorials?.map((editorial: any) => {
          return (
            <EditorialItemCard key={editorial.slug} editorial={editorial} />
          );
        })}
      </div>
    </div>
  );
}
