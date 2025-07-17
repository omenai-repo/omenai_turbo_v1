"use client";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import { getEditorial } from "@omenai/shared-lib/editorials/getSingleEditorial";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import ArticleRenderer from "./ArticleRenderer";

export default function ArticleViewWrapper({ slug }: { slug: string }) {
  const params = useSearchParams();
  const id = params.get("id");

  const { data: editorial, isLoading: loading } = useQuery({
    queryKey: ["fetch_admin_editorials", id, slug], // Include id in query key
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing ID parameter");
      }

      const response = await getEditorial(id, slug);

      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial, please refresh or contact IT support",
          "error"
        );
        return null;
      }

      return response.data;
    },
    enabled: !!id, // Only run query when id exists
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  // Handle different states
  if (!id) notFound();

  if (loading) return <Load />;

  if (!editorial) {
    return (
      <div>
        <p>No editorial found</p>
      </div>
    );
  }

  return <ArticleRenderer article={editorial as any} />;
}
