/**
 * Helper: upload limits lookup (kept same as your original mapping)
 */
type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";

const uploadLimits: Record<PlanName, Record<PlanInterval, number>> = {
  Basic: { monthly: 15, yearly: 180 },
  Pro: { monthly: 60, yearly: 760 },
  Premium: {
    monthly: Number.MAX_SAFE_INTEGER,
    yearly: Number.MAX_SAFE_INTEGER,
  },
};

export function getUploadLimitLookup(
  planName: PlanName,
  planInterval: PlanInterval,
  free_trial?: boolean,
): number {
  const limit = uploadLimits[planName][planInterval];

  // If count is provided and the limit is not "Unlimited", multiply the limit
  if (free_trial && limit !== Number.MAX_SAFE_INTEGER) {
    return 160; // If free, trial, users get 160 uploads for free for the first 2 months
  }

  return limit;
}
