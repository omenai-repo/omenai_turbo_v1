import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface PriceInputSectionProps {
  recommendedPrice: number;
  maxAllowedPrice: number; // NEW: Passed from parent to check the threshold
  requestedPrice: number | "";
  setRequestedPrice: (val: number | "") => void;
  hasAutoApprovalsRemaining: boolean;
}

export default function PriceInputSection({
  recommendedPrice,
  maxAllowedPrice,
  requestedPrice,
  setRequestedPrice,
  hasAutoApprovalsRemaining,
}: PriceInputSectionProps) {
  const isBelowMinimum =
    requestedPrice !== "" && requestedPrice < recommendedPrice;
  const isWithinVariance =
    requestedPrice !== "" &&
    requestedPrice >= recommendedPrice &&
    requestedPrice <= maxAllowedPrice;

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
          className={`${INPUT_CLASS} pl-8 bg-white ${
            isBelowMinimum
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
              : "border-neutral-300 focus:border-dark focus:ring-dark"
          } shadow-sm py-3.5`}
          required
          min={recommendedPrice}
        />
      </div>

      <AnimatePresence mode="wait">
        {requestedPrice !== "" && (
          <motion.div
            key={
              isBelowMinimum
                ? "error"
                : isWithinVariance
                  ? "variance"
                  : "significant"
            }
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-2 p-3 rounded-lg border flex items-start gap-2 ${
                isBelowMinimum
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : isWithinVariance && hasAutoApprovalsRemaining
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {isBelowMinimum ? (
                <>
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <span className="text-xs font-medium">
                    Price cannot be set lower than the algorithm's baseline
                    recommendation of ${recommendedPrice.toLocaleString()}.
                  </span>
                </>
              ) : isWithinVariance && hasAutoApprovalsRemaining ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <span className="text-xs font-medium">
                    This price falls within your tier's acceptable variance. It
                    will be auto-approved instantly.
                  </span>
                </>
              ) : isWithinVariance && !hasAutoApprovalsRemaining ? (
                // Shows ONLY when in variance but out of allowances
                <>
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium">
                    You&apos;ve used all your instant price approvals for this
                    period. To help maintain platform integrity, this price
                    adjustment will now go through a quick review by our
                    Advisory Team.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium">
                    This is a significant change from the baseline. Our Advisory
                    team will review before publishing.
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
