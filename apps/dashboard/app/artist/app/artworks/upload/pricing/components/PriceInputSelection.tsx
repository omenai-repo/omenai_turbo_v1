import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface PriceInputSectionProps {
  recommendedPrice: number;
  requestedPrice: number | "";
  setRequestedPrice: (val: number | "") => void;
  isAutoApproveZone: boolean;
}

export default function PriceInputSection({
  recommendedPrice,
  requestedPrice,
  setRequestedPrice,
  isAutoApproveZone,
}: PriceInputSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-dark">
        Target Listing Price (USD)
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
          $
        </span>
        <input
          type="number"
          value={requestedPrice}
          onChange={(e) =>
            setRequestedPrice(e.target.value ? Number(e.target.value) : "")
          }
          placeholder={`${recommendedPrice.toLocaleString()}`}
          className={`${INPUT_CLASS} pl-8 bg-white border-neutral-300 shadow-sm focus:border-dark focus:ring-dark py-3.5`}
          required
          min={1}
        />
      </div>

      <AnimatePresence mode="wait">
        {requestedPrice !== "" && (
          <motion.div
            key={isAutoApproveZone ? "auto" : "review"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-2 p-3 rounded -lg border flex items-start gap-2 ${
                isAutoApproveZone
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {isAutoApproveZone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <span className="text-xs font-medium">
                    This price falls within your tier's acceptable variance. It
                    will be auto-approved instantly.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium">
                    This is a significant increase from the baseline. Our team
                    will review your proof of value before publishing.
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
