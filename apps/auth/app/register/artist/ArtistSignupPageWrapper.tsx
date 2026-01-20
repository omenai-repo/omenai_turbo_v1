"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import OnboardingBlockerScreen from "@omenai/shared-ui-components/components/blockers/onboarding/OboardingBlockerScreen";
import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";
import { useRouter } from "next/navigation";

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
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true,
  );
  const router = useRouter();
  if (waitlistActivated) {
    if (!referrerKey || !email || !inviteCode) router.replace("/register");
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
