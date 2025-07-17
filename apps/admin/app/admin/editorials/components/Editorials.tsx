"use client";

import { useQuery } from "@tanstack/react-query";
import { listEditorials } from "../lib/getEditorials";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import EditorialItemCard from "@omenai/shared-ui-components/components/editorials/EditorialItemCard";
export default function Editorials() {
  const { data: editorials, isLoading: loading } = useQuery({
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
  });
  if (loading) return <Load />;
  if (editorials && editorials.length === 0)
    return (
      <div>
        <p>No editorials uploaded</p>
      </div>
    );

  return (
    <div className="grid grid-cols-5 gap-4 items-center justify-center">
      {(editorials as any[])?.map((editorial) => (
        <EditorialItemCard key={editorial.slug} editorial={editorial} />
      ))}
    </div>
  );
}
