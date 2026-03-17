import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

// Children
import ReviewCardHeader from "./ReviewCardHeader";
import ArtistSubmissionDetails from "./ArtistSubmissionDetails";
import CurationResponse from "./CurationResponse";
import ReviewActionPanel from "./ReviewActionPanel";

interface ReviewCardProps {
  review: any;
  onResolve: (action: "ACCEPT" | "DECLINE") => void;
  isMutating: boolean;
}

export default function ReviewCard({
  review,
  onResolve,
  isMutating,
}: ReviewCardProps) {
  const isActionRequired = review.status === "PENDING_ARTIST_ACTION";
  const { artwork } = review.meta;
  const image_href = getOptimizedImage(artwork.url, "small");

  const { justification_type, justification_proof_url, justification_notes } =
    review.artist_review || {};

  // --- STATE ---
  const [isExpanded, setIsExpanded] = useState(isActionRequired); // Auto-expand if needed
  const [isAccepting, setIsAccepting] = useState(false);

  // Legal flow state
  const [priceConsent, setPriceConsent] = useState(false);
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);

  const allTermsAccepted = priceConsent && acknowledgment && penaltyConsent;

  // --- HANDLERS ---
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setIsAccepting(false);
      setPriceConsent(false);
      setAcknowledgment(false);
      setPenaltyConsent(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isActionRequired
          ? "border-amber-300 shadow-sm ring-1 ring-amber-50"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      }`}
    >
      <ReviewCardHeader
        artwork={artwork}
        review={review}
        imageHref={image_href}
        isActionRequired={isActionRequired}
        isExpanded={isExpanded}
        onToggle={toggleAccordion}
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-neutral-100 bg-neutral-50/50"
          >
            <div className="p-4 sm:p-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Context Area */}
              <div
                className={`${isAccepting ? "lg:col-span-12" : "lg:col-span-8"} flex flex-col gap-4 transition-all duration-300`}
              >
                <ArtistSubmissionDetails
                  justificationType={justification_type}
                  justificationProofUrl={justification_proof_url}
                  justificationNotes={justification_notes}
                />
                <CurationResponse
                  status={review.status}
                  adminNotes={review.review.admin_notes}
                  declineReason={review.review.decline_reason}
                />
              </div>

              {/* Action Area */}
              <div
                className={`${isAccepting ? "lg:col-span-12 mt-2" : "lg:col-span-4"} flex flex-col justify-center`}
              >
                {isActionRequired && (
                  <ReviewActionPanel
                    isAccepting={isAccepting}
                    setIsAccepting={setIsAccepting}
                    isMutating={isMutating}
                    onResolve={onResolve}
                    legalTerms={{
                      priceConsent,
                      setPriceConsent,
                      acknowledgment,
                      setAcknowledgment,
                      penaltyConsent,
                      setPenaltyConsent,
                      allTermsAccepted,
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
