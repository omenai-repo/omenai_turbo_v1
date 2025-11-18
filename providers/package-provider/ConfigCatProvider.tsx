"use client";
import { ConfigCatProvider } from "configcat-react";

const HIGH_RISK_SDK_KEY =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY as string) // TODO: Change this to production key when going live
    : (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY as string);

const LOW_RISK_SDK_KEY =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_LOW_RISK_SDK_KEY as string) // TODO: Change this to production key when going live
    : (process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_LOW_RISK_SDK_KEY as string);

export function HighRiskProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigCatProvider
      sdkKey={HIGH_RISK_SDK_KEY}
      options={{ pollIntervalSeconds: 60 }}
    >
      {children}
    </ConfigCatProvider>
  );
}
export function LowRiskProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigCatProvider
      sdkKey={LOW_RISK_SDK_KEY}
      options={{ pollIntervalSeconds: 60 }}
    >
      {children}
    </ConfigCatProvider>
  );
}
