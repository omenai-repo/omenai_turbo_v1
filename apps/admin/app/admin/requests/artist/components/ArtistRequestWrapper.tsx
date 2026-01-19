"use client";
import { Badge, Tabs } from "@mantine/core";

import { useQuery } from "@tanstack/react-query";
import { fetchArtistsOnVerifStatus } from "@omenai/shared-services/admin/fetch_artist_on_verif_status";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { ArtistSchemaTypes, GallerySchemaTypes } from "@omenai/shared-types";
import ApprovedArtistRequest from "./ApprovedArtistRequest";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";
import Waitlist from "./Waitlist";

import PendingArtistRequests from "./PendingArtistRequest";

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
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-neutral-900">
          Artist Requests
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
            <PendingArtistRequests artists={pending} />
          </Tabs.Panel>

          <Tabs.Panel value="approved">
            <ApprovedArtistRequest artists={approved} />
          </Tabs.Panel>

          <Tabs.Panel value="waitlist">
            <Waitlist />
          </Tabs.Panel>
        </Tabs>
      </div>
    </section>
  );
}
