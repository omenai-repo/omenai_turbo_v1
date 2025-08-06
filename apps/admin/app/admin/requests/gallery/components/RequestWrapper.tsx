"use client";
import { Tabs } from "@mantine/core";
import PendingGalleryRequests from "./PendingGalleryRequests";
import ApprovedGalleryRequests from "./ApprovedGalleryRequests";
import { useQuery } from "@tanstack/react-query";
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

  // Check permissions
  if (!canAccessRoute(user.access_role, "requests")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  const { data: galleries, isLoading: loading } = useQuery({
    queryKey: ["fetch_galleries_on_verif_status"],
    queryFn: async () => {
      const response = await fetchGalleriesOnVerifStatus();

      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
  });

  if (loading) return <Load />;

  const pending: GalleryType[] = galleries.filter(
    (gallery: GalleryType) => !gallery.gallery_verified
  );
  console.log(pending);

  const approved: GalleryType[] = galleries.filter(
    (gallery: GalleryType) => gallery.gallery_verified
  );
  return (
    <Tabs defaultValue="Pending">
      <Tabs.List>
        <Tabs.Tab value="Pending">Pending Requests</Tabs.Tab>
        <Tabs.Tab value="Approved">Approved Galleries</Tabs.Tab>
        {/* <Tabs.Tab value="settings">Rejected Galleries</Tabs.Tab> */}
      </Tabs.List>

      <Tabs.Panel value="Pending" className="mt-4">
        <PendingGalleryRequests galleries={pending} />
      </Tabs.Panel>

      <Tabs.Panel value="Approved" className="mt-4">
        <ApprovedGalleryRequests galleries={approved} />
      </Tabs.Panel>

      {/* <Tabs.Panel value="settings">
        <RejectedGalleryRequests />
      </Tabs.Panel> */}
    </Tabs>
  );
}
