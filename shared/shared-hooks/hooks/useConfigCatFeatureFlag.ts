// hooks/useFeatureFlag.ts
"use client";

import { useFeatureFlag as useConfigCatFlag } from "configcat-react";

export function useHighRiskFeatureFlag(flagName: string, defaultValue = false) {
  const isEnabled = useConfigCatFlag(flagName, defaultValue);
  return isEnabled;
}
export function useLowRiskFeatureFlag(flagName: string, defaultValue = false) {
  const isEnabled = useConfigCatFlag(flagName, defaultValue);
  return isEnabled;
}
