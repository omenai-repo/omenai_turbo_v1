import { useState } from "react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

// Components
import ArtworkMetadataDrawer from "./ArtworkMetaDataDrawer";
import ArtworkContextHeader from "./ArtworkContextHeader";
import JustificationProof from "./JustificationProof";
import TriageActionPanel from "./TriageActionPanel";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

interface ReviewWorkspaceProps {
  review: any;
  onAction: (payload: any) => void;
  isMutating: boolean;
}

export default function ReviewWorkspace({
  review,
  onAction,
  isMutating,
}: ReviewWorkspaceProps) {
  const [activeAction, setActiveAction] = useState<
    "APPROVE" | "COUNTER_OFFER" | "DECLINE" | null
  >(null);
  const [counterPrice, setCounterPrice] = useState<number | "">("");
  const [adminNotes, setAdminNotes] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!review) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
        Select a request from the queue to begin reviewing.
      </div>
    );
  }

  const { artwork, algorithm_recommendation } = review.meta;
  const image_href = getOptimizedImage(artwork.url, "medium");
  const {
    requested_price,
    justification_type,
    justification_proof_url,
    justification_notes,
  } = review.artist_review;

  const handleSubmit = () => {
    if (
      activeAction === "COUNTER_OFFER" &&
      (!counterPrice || counterPrice <= 0)
    ) {
      toast_notif("Please provide a valid counter offer value", "error");
      return;
    }

    if (activeAction === "COUNTER_OFFER" && !adminNotes) {
      toast_notif(
        "Please provide a note for the artist explaining the reason behind the counter-offer",
        "error",
      );
      return;
    }
    if (activeAction === "DECLINE" && !declineReason) {
      toast_notif(
        "Please provide a reason for declining this request",
        "error",
      );
      return;
    }

    onAction({
      review_id: review._id,
      action: activeAction,
      counter_offer_price:
        activeAction === "COUNTER_OFFER" ? counterPrice : null,
      admin_notes: activeAction === "COUNTER_OFFER" ? adminNotes : null,
      decline_reason: activeAction === "DECLINE" ? declineReason : null,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto relative">
      <ArtworkMetadataDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        artwork={artwork}
        imageHref={image_href}
      />

      <ArtworkContextHeader
        artwork={artwork}
        artistId={review.artist_id}
        imageHref={image_href}
        algorithmRecommendation={algorithm_recommendation}
        requestedPrice={requested_price}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <JustificationProof
        justificationType={justification_type}
        justificationProofUrl={justification_proof_url}
        justificationNotes={justification_notes}
      />

      <TriageActionPanel
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        counterPrice={counterPrice}
        setCounterPrice={setCounterPrice}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        declineReason={declineReason}
        setDeclineReason={setDeclineReason}
        onSubmit={handleSubmit}
        isMutating={isMutating}
      />
    </div>
  );
}
