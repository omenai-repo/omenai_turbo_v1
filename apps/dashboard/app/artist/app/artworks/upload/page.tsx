"use client";

import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { auth_uri } from "@omenai/url-config/src/config";

export default function UploadArtwork() {
  const { session } = useContext(SessionContext);

  const url = auth_uri();
  const router = useRouter();
  if (session === undefined) router.replace(url);

  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />

      <UploadArtworkDetails />
    </div>
  );
}
