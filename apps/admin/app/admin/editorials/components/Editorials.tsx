"use client";

import { useQuery } from "@tanstack/react-query";
import { listEditorials } from "../lib/getEditorials";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import EditorialItemCard from "./EditorialItemCard";
import { useRollbar } from "@rollbar/react";
export default function Editorials() {
  const { data: editorials, isLoading: loading } = useQuery({
    queryKey: ["fetch_admin_editorials"],
    queryFn: async () => {
      const response = await listEditorials();
      console.log(response);

      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial list, please refresh or contact IT support",
          "error"
        );

        return [];
      }

      return response.data;
    },
  });
  if (loading) return <Load />;
  if (editorials && editorials.length === 0)
    return (
      <div>
        <p>No editorials uploaded</p>
      </div>
    );

  console.log(editorials);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 sm:gap-6 lg:gap-8 p-4">
      {(editorials as any[])?.map((editorial) => (
        <EditorialItemCard key={editorial.slug} editorial={editorial} />
      ))}
    </div>
  );
}
