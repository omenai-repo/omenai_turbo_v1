"use client";

import { useQuery } from "@tanstack/react-query";
import { listEditorials } from "../lib/getEditorials";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import EditorialItemCard from "./EditorialItemCard";

export default function Editorials() {
  const { data: editorials, isLoading } = useQuery({
    queryKey: ["fetch_admin_editorials"],
    queryFn: async () => {
      const response = await listEditorials();

      if (!response.isOk) {
        toast_notif(
          "Error fetching editorials. Please refresh or contact support.",
          "error"
        );
        return [];
      }

      return response.data;
    },
  });

  if (isLoading) return <Load />;

  if (!editorials || editorials.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-neutral-700">
          No editorials yet
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Published editorials will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid gap-6
        grid-cols-[repeat(auto-fill,minmax(280px,1fr))]
      "
    >
      {editorials.map((editorial: any) => (
        <EditorialItemCard key={editorial.slug} editorial={editorial} />
      ))}
    </div>
  );
}
