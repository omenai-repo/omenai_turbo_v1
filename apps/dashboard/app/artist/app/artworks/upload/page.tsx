"use client";

import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import {
  SessionContext,
  useSession,
} from "@omenai/package-provider/SessionProvider";
import { auth_uri } from "@omenai/url-config/src/config";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { toast } from "sonner";

export default function UploadArtwork() {
  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />

      <UploadArtworkDetails />
    </div>
  );
}
