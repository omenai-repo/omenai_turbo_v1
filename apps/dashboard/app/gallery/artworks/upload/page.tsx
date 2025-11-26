"use client";
import UploadArtwork from "./UploadWrapper";
export const dynamic = "force-dynamic";

import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import ArtworkUploadBlocker from "@omenai/shared-ui-components/components/blockers/upload/UploadBlockerScreen";

export default function UploadArtworkContainer() {
  const { value: isArtworkUploadEnabled } = useHighRiskFeatureFlag(
    "artwork_upload_enabled"
  );
  return (
    <>
      {!isArtworkUploadEnabled ? (
        <ArtworkUploadBlocker entity="gallery" />
      ) : (
        <UploadArtwork />
      )}
    </>
  );
}
