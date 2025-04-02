import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { toast } from "sonner";

const toastError = (desc: string) => {
  toast.error("Error notification - Invalid data", {
    description: desc,
    style: {
      background: "red",
      color: "white",
    },
    className: "class",
  });
};
export const validateOnboarding = (
  onboardingData: Record<string, any>,
  field_completion_state: Record<string, boolean>
) => {
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
  const hasFalse = Object.values(field_completion_state).some(
    (value) => !value
  );
  const socialHasEmptyString = Object.values(socials).every(
    (value) => typeof value === "string" && value === ""
  );
  if (cv === null) toastError("Please upload your CV");

  if (hasFalse)
    toastError(
      "Some fields are empty. Please fill all required fields to proceed."
    );
  if (socialHasEmptyString)
    toastError("At least one social media handle is required");
  if (hasEmptyString)
    toastError("Please ensure to fill in all fields in order to proceed.");

  if (hasEmptyString || hasFalse || socialHasEmptyString) return false;
  else return true;
};
