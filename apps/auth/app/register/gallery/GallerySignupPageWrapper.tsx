"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import OnboardingBlockerScreen from "@omenai/shared-ui-components/components/blockers/onboarding/OboardingBlockerScreen";
import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { validateInviteToken } from "@omenai/shared-services/auth/waitlist/validateInviteToken";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

export default function GallerySignupPageWrapper({
  referrerKey,
  email,
  inviteCode,
}: Readonly<{
  referrerKey: string | undefined;
  email: string | undefined;
  inviteCode: string | undefined;
}>) {
  const { value: collectorOnboardingEnabled } = useLowRiskFeatureFlag(
    "galleryonboardingenabled"
  );
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  if (waitlistActivated && !referrerKey) redirect("/waitlist?entity=gallery");

  const { data } = useQuery({
    queryKey: ["gallery_signup"],
    queryFn: async () => {
      return await validateInviteToken({
        referrerKey: referrerKey as string,
        email: email as string,
        entity: "gallery",
        inviteCode: inviteCode as string,
      });
    },
    enabled: !!waitlistActivated,
  });
  if (data?.status !== 200) {
    toast_notif(data?.message, "error");
    redirect("/waitlist?entity=gallery");
  }

  return (
    <>
      {!collectorOnboardingEnabled ? (
        <OnboardingBlockerScreen />
      ) : (
        <section className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
          {/* Side Image - hidden on small screens, fixed on large screens */}
          <div className="hidden lg:block fixed top-0 left-0 w-1/2 h-screen">
            <ImageBlock />
          </div>

          {/* Form Section - full width on mobile, scrollable, and centered */}
          <div className="w-full h-screen overflow-y-auto lg:ml-[100%]">
            <div className="flex items-center justify-center min-h-screen p-6">
              <div className="w-full max-w-xl">
                <FormBlock />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
