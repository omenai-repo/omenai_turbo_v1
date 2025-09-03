/**
 * Helper: upload limits lookup (kept same as your original mapping)
 */
type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";
const uploadLimits: Record<PlanName, Record<PlanInterval, number>> = {
  Basic: { monthly: 5, yearly: 75 },
  Pro: { monthly: 15, yearly: 225 },
  Premium: {
    monthly: Number.MAX_SAFE_INTEGER,
    yearly: Number.MAX_SAFE_INTEGER,
  },
};
export function getUploadLimitLookup(
  planName: PlanName,
  planInterval: PlanInterval
): number {
  return uploadLimits[planName][planInterval];
}
