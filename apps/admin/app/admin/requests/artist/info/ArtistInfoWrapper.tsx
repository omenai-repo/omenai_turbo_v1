"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { fetchArtistVerificationInfo } from "@omenai/shared-services/admin/fetch_artist_verif_info";
import { notFound, useSearchParams } from "next/navigation";
import { ArtistAlgorithmData, ArtistSchemaTypes } from "@omenai/shared-types";
import ArtistInfo from "./ArtistInfo";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export type VerificationInfoType = {
  artist: Pick<
    ArtistSchemaTypes,
    | "name"
    | "documentation"
    | "art_style"
    | "artist_id"
    | "logo"
    | "address"
    | "email"
  >;
  request: ArtistAlgorithmData;
};
export default function ArtistInfoWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return notFound();

  const { data: verif_info, isLoading: loading } = useQuery({
    queryKey: ["fetch_artist_verif_info"],
    queryFn: async () => {
      const response = await fetchArtistVerificationInfo(id);

      if (!response.isOk || response.data === undefined)
        throw new Error("Something went wrong");

      return response.data as VerificationInfoType;
    },
  });

  if (loading) return <Load />;

  return <ArtistInfo data={verif_info as VerificationInfoType} />;
}
