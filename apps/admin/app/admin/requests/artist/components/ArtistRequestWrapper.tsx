"use client";
import { Tabs } from "@mantine/core";

import { useQuery } from "@tanstack/react-query";
import { fetchArtistsOnVerifStatus } from "@omenai/shared-services/admin/fetch_artist_on_verif_status";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { ArtistSchemaTypes, GallerySchemaTypes } from "@omenai/shared-types";
import PendingArtistRequest from "./PendingArtistRequest";
import ApprovedArtistRequest from "./ApprovedArtistRequest";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export type ArtistType = Pick<
  ArtistSchemaTypes,
  "name" | "logo" | "email" | "artist_verified" | "artist_id"
>;
export function ArtistRequestWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "requests")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  const { data: artists, isLoading: loading } = useQuery({
    queryKey: ["fetch_artists_on_verif_status"],
    queryFn: async () => {
      const response = await fetchArtistsOnVerifStatus();

      if (!response.isOk) throw new Error(response.message);
      return response.data;
    },
  });

  if (loading) return <Load />;

  const pending: ArtistType[] = artists.filter(
    (artist: ArtistType) => !artist.artist_verified
  );

  const approved: ArtistType[] = artists.filter(
    (artist: ArtistType) => artist.artist_verified
  );
  return (
    <Tabs defaultValue="Pending">
      <Tabs.List>
        <Tabs.Tab value="Pending">Pending Requests</Tabs.Tab>
        <Tabs.Tab value="Approved">Approved Artists</Tabs.Tab>
        {/* <Tabs.Tab value="settings">Rejected Galleries</Tabs.Tab> */}
      </Tabs.List>

      <Tabs.Panel value="Pending" className="mt-4">
        <PendingArtistRequest artists={pending} />
      </Tabs.Panel>

      <Tabs.Panel value="Approved" className="mt-4">
        <ApprovedArtistRequest artists={approved} />
      </Tabs.Panel>

      {/* <Tabs.Panel value="settings">
        <RejectedGalleryRequests />
      </Tabs.Panel> */}
    </Tabs>
  );
}
