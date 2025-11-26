"use client";
import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";

import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import ArtworkUploadBlocker from "@omenai/shared-ui-components/components/blockers/upload/UploadBlockerScreen";
export default function UploadArtwork() {
  const { value: isArtworkUploadEnabled } = useHighRiskFeatureFlag(
    "artwork_upload_enabled"
  );

  const { value: isArtworkPriceCalculationEnabled } = useHighRiskFeatureFlag(
    "artwork_price_calculation_enabled"
  );
  return (
    <div className="relative">
      {!isArtworkUploadEnabled || !isArtworkPriceCalculationEnabled ? (
        <ArtworkUploadBlocker entity="artist" />
      ) : (
        <div>
          <PageTitle title="Upload an artwork" />
          <UploadArtworkDetails />
        </div>
      )}
    </div>
  );
}
