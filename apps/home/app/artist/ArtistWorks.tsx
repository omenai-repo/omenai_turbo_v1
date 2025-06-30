import React from "react";
import ArtistInfo from "./ArtistInfo";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { Tabs } from "@mantine/core";
import ArtworkListing from "./ArtworksListing";

export default function ArtistWorks({
  loading,
  artworks,
}: {
  loading: boolean;
  artworks: ArtworkSchemaTypes[];
}) {
  return (
    <Tabs variant="default" defaultValue="artworks">
      <Tabs.List>
        <Tabs.Tab value="artworks" leftSection={null} className="text-fluid-xs">
          Artworks by this artist
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="artworks" className="m-5">
        <ArtworkListing artworks={artworks} />
      </Tabs.Panel>
    </Tabs>
  );
}
