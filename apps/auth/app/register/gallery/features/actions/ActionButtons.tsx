import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { validateAddress } from "@omenai/shared-services/address_validation/validateAddress";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
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
          "success"
        );
        handleClickNext();
      }
    } catch (error) {
      toast_notif(
        "Something went wrong. Could be us, please contact support",
        "error"
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
        }   bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer"
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
