/**
 * Helper: upload limits lookup (kept same as your original mapping)
 */
type PlanName = "Foundation" | "Gallery" | "Principal";
type PlanInterval = "monthly" | "yearly";

const uploadLimits: Record<PlanName, Record<PlanInterval, number>> = {
  Foundation: { monthly: 15, yearly: 180 },
  Gallery: { monthly: 60, yearly: 760 },
  Principal: {
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
    return 60;
  }

  return limit;
}
