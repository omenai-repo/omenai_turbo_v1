"use client";

import { Tabs, Badge } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import PendingGalleryRequests from "./PendingGalleryRequests";
import ApprovedGalleryRequests from "./ApprovedGalleryRequests";
import Waitlist from "./Waitlist";

import { fetchGalleriesOnVerifStatus } from "@omenai/shared-services/admin/fetch_galleries_on_verif_status";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export type GalleryType = Pick<
  GallerySchemaTypes,
  | "address"
  | "name"
  | "email"
  | "admin"
  | "logo"
  | "description"
  | "gallery_id"
  | "status"
  | "gallery_verified"
>;

export function GalleryRequestWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "requests")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  const { data: galleries = [], isLoading } = useQuery({
    queryKey: ["fetch_galleries_on_verif_status"],
    queryFn: async () => {
      const response = await fetchGalleriesOnVerifStatus();
      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
  });

  if (isLoading) return <Load />;

  const pending = galleries.filter(
    (gallery: GalleryType) => !gallery.gallery_verified
  );

  const approved = galleries.filter(
    (gallery: GalleryType) => gallery.gallery_verified
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-neutral-900">
          Gallery Requests
        </h1>
        <p className="text-sm text-neutral-500">
          Review, approve, and manage gallery verification requests
        </p>
      </header>

      {/* Tabs Container */}
      <div className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
        <Tabs defaultValue="pending" variant="pills" radius="sm">
          <Tabs.List className="mb-4 flex gap-2">
            <Tabs.Tab value="pending">
              <div className="flex items-center gap-2">
                <span>Pending</span>
                <Badge size="sm" variant="filled" color="orange">
                  {pending.length}
                </Badge>
              </div>
            </Tabs.Tab>

            <Tabs.Tab value="approved">
              <div className="flex items-center gap-2">
                <span>Approved</span>
                <Badge size="sm" variant="light" color="green">
                  {approved.length}
                </Badge>
              </div>
            </Tabs.Tab>

            <Tabs.Tab value="waitlist">
              <span>Waitlist</span>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending">
            <PendingGalleryRequests galleries={pending} />
          </Tabs.Panel>

          <Tabs.Panel value="approved">
            <ApprovedGalleryRequests galleries={approved} />
          </Tabs.Panel>

          <Tabs.Panel value="waitlist">
            <Waitlist />
          </Tabs.Panel>
        </Tabs>
      </div>
    </section>
  );
}
