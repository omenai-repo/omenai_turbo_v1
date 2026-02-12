import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import { validateInviteToken } from "@omenai/shared-services/auth/waitlist/validateInviteToken";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

type Entity = "artist" | "gallery";

interface UseWaitlistValidationParams {
  entity: Entity;
  referrerKey: string | undefined;
  email: string | undefined;
  inviteCode: string | undefined;
}

export const useWaitlistValidation = ({
  entity,
  referrerKey,
  email,
  inviteCode,
}: UseWaitlistValidationParams) => {
  const router = useRouter();
  const { value: waitlistActivated } =
    useLowRiskFeatureFlag("waitlistActivated");

  // Redirect if waitlist is active but params are missing
  useEffect(() => {
    if (waitlistActivated && (!referrerKey || !email || !inviteCode)) {
      router.push(`/waitlist?entity=${entity}`);
    }
  }, [waitlistActivated, referrerKey, email, inviteCode, entity, router]);

  const { data, isLoading } = useQuery({
    queryKey: [`${entity}_signup`, referrerKey, email, inviteCode],
    queryFn: async () => {
      return await validateInviteToken({
        referrerKey: referrerKey!,
        email: email!,
        entity,
        inviteCode: inviteCode!,
      });
    },
    enabled: waitlistActivated && !!referrerKey,
    refetchOnWindowFocus: false,
  });

  // Handle validation errors
  useEffect(() => {
    if (data && data.status !== 200) {
      toast_notif(data.message, "error");
      router.replace(`/waitlist?entity=${entity}`);
    }
  }, [data, entity, router]);

  return {
    isLoading: waitlistActivated && isLoading,
    data,
    waitlistActivated,
  };
};
