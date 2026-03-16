import { motion, AnimatePresence } from "framer-motion";
import { JustificationType } from "@omenai/shared-types";
import {
  INPUT_CLASS,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

interface JustificationSectionProps {
  justificationType: JustificationType | "";
  setJustificationType: (val: JustificationType) => void;
  justificationUrl: string;
  setJustificationUrl: (val: string) => void;
  justificationNotes: string;
  setJustificationNotes: (val: string) => void;
}

export default function JustificationSection({
  justificationType,
  setJustificationType,
  justificationUrl,
  setJustificationUrl,
  justificationNotes,
  setJustificationNotes,
}: JustificationSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-5 border-t border-neutral-200 pt-5 mt-2"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-dark">
          Data Source / Justification
        </label>
        <select
          value={justificationType}
          onChange={(e) =>
            setJustificationType(e.target.value as JustificationType)
          }
          className={`${SELECT_CLASS} bg-white border-neutral-300 py-3.5`}
          required
        >
          <option value="" disabled>
            Select your proof of value...
          </option>
          <option value="PAST_SALE">Past Sale of Similar Work</option>
          <option value="GALLERY_EXHIBITION">Part of Gallery Exhibition</option>
          <option value="HIGH_COST_MATERIALS">High Cost of Materials</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <AnimatePresence>
        {(justificationType === "PAST_SALE" ||
          justificationType === "GALLERY_EXHIBITION") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            <label className="text-sm font-bold text-dark">
              URL Link to Proof <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={justificationUrl}
              onChange={(e) => setJustificationUrl(e.target.value)}
              placeholder="e.g. https://artsy.net/sale/your-piece"
              className={`${INPUT_CLASS} bg-white border-neutral-300 py-3.5`}
              required
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-dark">
          Contextual Notes (Optional)
        </label>
        <textarea
          value={justificationNotes}
          onChange={(e) => setJustificationNotes(e.target.value)}
          placeholder="Help our review team understand the price increase..."
          rows={3}
          className={`${TEXTAREA_CLASS} bg-white border-neutral-300 resize-none`}
        />
      </div>
    </motion.div>
  );
}
