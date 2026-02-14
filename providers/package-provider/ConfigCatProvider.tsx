"use client";
import { ConfigCatProvider } from "configcat-react";

const highRiskSdkKey =
  process.env.APP_ENV === "production"
    ? (process.env.NEXT_PUBLIC_CONFIGCAT_HIGH_RISK_SDK_KEY as string)
    : (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY as string);

const lowRiskSdkKey =
  process.env.APP_ENV === "production"
    ? (process.env.NEXT_PUBLIC_CONFIGCAT_LOW_RISK_SDK_KEY as string)
    : (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_LOW_RISK_SDK_KEY as string);

export function HighRiskProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigCatProvider
      sdkKey={highRiskSdkKey}
      options={{ pollIntervalSeconds: 60 }}
    >
      {children}
    </ConfigCatProvider>
  );
}
export function LowRiskProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigCatProvider
      sdkKey={lowRiskSdkKey}
      options={{ pollIntervalSeconds: 60 }}
    >
      {children}
    </ConfigCatProvider>
  );
}
