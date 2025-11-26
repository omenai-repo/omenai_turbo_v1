import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { validateAddress } from "@omenai/shared-services/address_validation/validateAddress";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
const steps = {
  0: ["name", "email"],
  1: ["country", "address_line", "state", "city", "zip"],
  2: ["password", "confirmPassword"],
  3: ["logo"],
  4: ["art_style"],
};

export default function () {
  const {
    currentArtistSignupFormIndex,
    decrementCurrentArtistSignupFormIndex,
    incrementCurrentArtistSignupFormIndex,
    isFieldDirty,
    artistSignupData,
  } = useArtistAuthStore();

  const [loading, setLoading] = useState<boolean>(false);
  const rollbar = useRollbar();

  const validateAddressCapability = async () => {
    if (artistSignupData.phone === "") {
      toast_notif(
        "Invalid input, please provide a valid phone number",
        "error"
      );

      return;
    }

    const payload = {
      type: "pickup" as "delivery" | "pickup",
      countryCode: artistSignupData.countryCode,
      postalCode: artistSignupData.zip,
      cityName: artistSignupData.state,
      countyName: artistSignupData.city,
    };

    setLoading(true);
    try {
      const response = await validateAddress(payload);

      if (!response.isOk) toast_notif(response.message, "error");
      else {
        toast_notif(
          "Address verifcation for pickup capability was successful",
          "success"
        );
        handleClickNext();
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast.error("Error notification", {
        description:
          "Something went wrong. Could be us, please contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleClickPrev = () => {
    decrementCurrentArtistSignupFormIndex();
  };
  const handleClickNext = () => {
    if (currentArtistSignupFormIndex === 2) {
      if (artistSignupData.password !== artistSignupData.confirmPassword) {
        toast_notif("Passwords do not match", "error");
        return;
      }
    }
    if (currentArtistSignupFormIndex === 4) {
      if (artistSignupData.art_style === "") {
        toast_notif("Please select an art style", "error");
        return;
      }
    }
    if (shouldDisableNext(isFieldDirty, currentArtistSignupFormIndex, steps)) {
      toast_notif("Invalid field values", "error");

      return;
    }
    incrementCurrentArtistSignupFormIndex();
  };
  return (
    <div className="w-full flex gap-4">
      <button
        className={`${
          currentArtistSignupFormIndex > 0 ? "block" : "hidden"
        }  border border-slate-400   bg-transparent text-dark hover:border-slate-800 disabled:cursor-not-allowedfocus:ring-0 duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer"
        type={"button"}
        disabled={
          (currentArtistSignupFormIndex === 1 && loading) ||
          (currentArtistSignupFormIndex === 1 && isFieldDirty["phone"])
        }
        onClick={
          currentArtistSignupFormIndex === 1
            ? validateAddressCapability
            : handleClickNext
        }
      >
        <span>
          {loading ? (
            <LoadSmall />
          ) : currentArtistSignupFormIndex === 1 ? (
            "Verify Address"
          ) : (
            "Continue"
          )}
        </span>
      </button>
    </div>
  );
}
