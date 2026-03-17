import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import ExclusivityAgreement from "../../artworks/upload/pricing/ExclusivityAgreement";

interface ReviewActionPanelProps {
  isAccepting: boolean;
  setIsAccepting: (val: boolean) => void;
  isMutating: boolean;
  onResolve: (action: "ACCEPT" | "DECLINE") => void;
  legalTerms: {
    priceConsent: boolean;
    setPriceConsent: (v: boolean) => void;
    acknowledgment: boolean;
    setAcknowledgment: (v: boolean) => void;
    penaltyConsent: boolean;
    setPenaltyConsent: (v: boolean) => void;
    allTermsAccepted: boolean;
  };
}

export default function ReviewActionPanel({
  isAccepting,
  setIsAccepting,
  isMutating,
  onResolve,
  legalTerms,
}: ReviewActionPanelProps) {
  const {
    priceConsent,
    setPriceConsent,
    acknowledgment,
    setAcknowledgment,
    penaltyConsent,
    setPenaltyConsent,
    allTermsAccepted,
  } = legalTerms;

  const handleCancelLegal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccepting(false);
    setPriceConsent(false);
    setAcknowledgment(false);
    setPenaltyConsent(false);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <AnimatePresence mode="wait">
        {!isAccepting ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-2.5 w-full"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAccepting(true);
              }}
              className="w-full flex justify-center items-center gap-2 bg-dark hover:bg-black text-white px-5 py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
            >
              <CheckCircle2 size={16} /> Accept & Publish
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve("DECLINE");
              }}
              disabled={isMutating}
              className="w-full flex justify-center items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 px-5 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              Decline & Cancel Upload
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="legal-terms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col w-full"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ExclusivityAgreement
                priceConsent={priceConsent}
                setPriceConsent={setPriceConsent}
                acknowledgment={acknowledgment}
                setAcknowledgment={setAcknowledgment}
                penaltyConsent={penaltyConsent}
                setPenaltyConsent={setPenaltyConsent}
              />
            </div>

            <div className="flex gap-3 justify-end mt-4 max-w-3xl mx-auto w-full">
              <button
                onClick={handleCancelLegal}
                className="px-6 py-3 text-sm font-semibold text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (allTermsAccepted) onResolve("ACCEPT");
                }}
                disabled={!allTermsAccepted || isMutating}
                className="px-8 py-3 text-sm font-semibold text-white bg-dark rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
              >
                {isMutating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Confirm & Publish"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
