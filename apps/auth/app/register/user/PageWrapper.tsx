"use client";
import Form from "./features/form/Form";
import ImageBlock from "./features/image/Image";
import OnboardingBlockerScreen from "@omenai/shared-ui-components/components/blockers/onboarding/OboardingBlockerScreen";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";

export default function CollectorSignup() {
  const { value: collectorOnboardingEnabled } = useLowRiskFeatureFlag(
    "collectoronboardingenabled",
    false,
  );
  return (
    <>
      {!collectorOnboardingEnabled ? (
        <OnboardingBlockerScreen />
      ) : (
        <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
          <ImageBlock />
          <Form />
        </section>
      )}
    </>
  );
}
