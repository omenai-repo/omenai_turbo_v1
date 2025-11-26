import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { toast } from "sonner";

const toastError = (desc: string) => {
  toast_notif(desc || "Error notification - Invalid data", "error");
};

export const validateOnboarding = (onboardingData: Record<string, any>) => {
  const {
    socials,
    cv,
    bienalle,
    museum_collection,
    museum_exhibition,
    solo,
    group,
    bio,
    mfa,
    art_fair,
  } = onboardingData;

  const isObjectEmptyString = {
    bienalle,
    museum_collection,
    museum_exhibition,
    solo,
    group,
    bio,
    mfa,
    art_fair,
  };

  const hasEmptyString = Object.values(isObjectEmptyString).some(
    (value) => typeof value === "string" && value === ""
  );

  const socialHasEmptyString = Object.values(socials).every(
    (value) => typeof value === "string" && value === ""
  );

  const cvValid = cv !== null;

  if (socialHasEmptyString)
    toastError("At least one social media handle is required");
  if (hasEmptyString)
    toastError("Please ensure to fill in all fields in order to proceed.");

  if (!cvValid) toastError("Please upload your CV");

  if (hasEmptyString || socialHasEmptyString || !cvValid) return false;
  else return true;
};
