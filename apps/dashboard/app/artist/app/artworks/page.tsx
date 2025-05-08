"use client";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { auth_uri } from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import PageTitle from "../components/PageTitle";
import ArtCatalog from "./components/ArtCatalog";

export default async function MyArtworks() {
  return (
    <div className="w-full h-full">
      <PageTitle title="My Artworks" />
      <ArtCatalog />
    </div>
  );
}
