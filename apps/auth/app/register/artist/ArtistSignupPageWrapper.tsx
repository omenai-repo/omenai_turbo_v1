"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import OnboardingBlockerScreen from "@omenai/shared-ui-components/components/blockers/onboarding/OboardingBlockerScreen";
import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useWaitlistValidation } from "../components/useWaitlistValidation";

export default function ArtistSignupPageWrapper({
  referrerKey,
  email,
  inviteCode,
}: Readonly<{
  referrerKey: string | undefined;
  email: string | undefined;
  inviteCode: string | undefined;
}>) {
  const { value: collectorOnboardingEnabled } = useLowRiskFeatureFlag(
    "collectoronboardingenabled",
    false,
  );
  const { isLoading } = useWaitlistValidation({
    entity: "artist",
    referrerKey,
    email,
    inviteCode,
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen grid place-items-center">
        <Load />
      </div>
    );
  }
  return (
    <>
      {collectorOnboardingEnabled ? (
        <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
          <ImageBlock />
          <FormBlock />
        </section>
      ) : (
        <OnboardingBlockerScreen />
      )}
    </>
  );
}
