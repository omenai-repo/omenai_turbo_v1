"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import OnboardingBlockerScreen from "@omenai/shared-ui-components/components/blockers/onboarding/OboardingBlockerScreen";
import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { validateInviteToken } from "@omenai/shared-services/auth/waitlist/validateInviteToken";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useEffect } from "react";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function GallerySignupPageWrapper({
  referrerKey,
  email,
  inviteCode,
}: Readonly<{
  referrerKey: string;
  email: string;
  inviteCode: string;
}>) {
  const router = useRouter();

  const { value: collectorOnboardingEnabled } = useLowRiskFeatureFlag(
    "galleryonboardingenabled",
  );
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["gallery_signup", referrerKey, email, inviteCode],
    queryFn: async () => {
      return await validateInviteToken({
        referrerKey,
        email,
        entity: "gallery",
        inviteCode,
      });
    },
    enabled: waitlistActivated && !!referrerKey,
    refetchOnWindowFocus: false,
  });

  // Handle validation errors in useEffect
  useEffect(() => {
    if (waitlistActivated && !referrerKey) {
      router.replace("/waitlist?entity=gallery");
    }
    if (data && data.status !== 200) {
      toast_notif(data.message, "error");
      router.replace("/waitlist?entity=gallery");
    }
  }, [data]);

  // Show loading state while validating
  if (waitlistActivated && isLoading) {
    return (
      <div className="w-full h-screen grid place-items-center">
        <Load />
      </div>
    );
  }

  return (
    <>
      {!collectorOnboardingEnabled ? (
        <OnboardingBlockerScreen />
      ) : (
        <section className="h-screen w-full bg-white overflow-hidden flex flex-col md:flex-row">
          <ImageBlock />
          <FormBlock />
        </section>
      )}
    </>
  );
}
