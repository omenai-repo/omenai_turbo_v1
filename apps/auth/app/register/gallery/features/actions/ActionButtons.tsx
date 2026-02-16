import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { validateAddress } from "@omenai/shared-services/address_validation/validateAddress";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
const steps = {
  0: ["name", "email", "admin"],
  1: ["country", "address_line", "state", "city", "zip"],
  2: ["password", "confirmPassword", "description"],
  3: ["logo"],
};

export default function () {
  const {
    currentGallerySignupFormIndex,
    decrementCurrentGallerySignupFormIndex,
    incrementCurrentGallerySignupFormIndex,
    isFieldDirty,
    gallerySignupData,
  } = useGalleryAuthStore();

  const [loading, setLoading] = useState<boolean>(false);
  const rollbar = useRollbar();

  const validateAddressCapability = async () => {
    if (gallerySignupData.phone === "") {
      toast.error("Error notification", {
        description: "Invalid input. Please enter a valid phone number",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });

      return;
    }
    const payload = {
      type: "pickup" as "delivery" | "pickup",
      countryCode: gallerySignupData.countryCode,
      postalCode: gallerySignupData.zip,
      cityName: gallerySignupData.state,
      countyName: gallerySignupData.city,
    };

    setLoading(true);
    try {
      const response = await validateAddress(payload);

      if (!response.isOk)
        toast.error("Error notification", {
          description: response.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        toast_notif(
          "Address verification for pickup capability was successful",
          "success",
        );
        handleClickNext();
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong. Could be us, please contact support",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleClickPrev = () => {
    decrementCurrentGallerySignupFormIndex();
  };
  const handleClickNext = () => {
    if (currentGallerySignupFormIndex === 2) {
      if (gallerySignupData.password !== gallerySignupData.confirmPassword) {
        toast.error("Error notification", {
          description: "Passwords do not match",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
    }
    if (shouldDisableNext(isFieldDirty, currentGallerySignupFormIndex, steps)) {
      toast.error("Error notification", {
        description: "Invalid field values",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });

      return;
    }
    incrementCurrentGallerySignupFormIndex();
  };
  return (
    <div className="w-full flex gap-4">
      <button
        className={`${
          currentGallerySignupFormIndex > 0 ? "block" : "hidden"
        } ${BUTTON_CLASS}`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className={BUTTON_CLASS}
        type={"button"}
        disabled={
          (currentGallerySignupFormIndex === 1 && loading) ||
          (currentGallerySignupFormIndex === 1 && isFieldDirty["phone"])
        }
        onClick={
          currentGallerySignupFormIndex === 1
            ? validateAddressCapability
            : handleClickNext
        }
      >
        <span>
          {loading ? (
            <LoadSmall />
          ) : currentGallerySignupFormIndex === 1 ? (
            "Verify Address"
          ) : (
            "Continue"
          )}
        </span>
      </button>
    </div>
  );
}
