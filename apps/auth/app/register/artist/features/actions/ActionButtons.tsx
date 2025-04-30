import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { validateAddress } from "@omenai/shared-services/address_validation/validateAddress";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
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

  const validateAddressCapability = async () => {
    if (artistSignupData.phone === "") {
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
      countryCode: artistSignupData.countryCode,
      postalCode: artistSignupData.zip,
      cityName: artistSignupData.state,
      countyName: artistSignupData.city,
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
        toast.success("Verification successful", {
          description:
            "Address verification for pickup capability was successful",
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        handleClickNext();
      }
    } catch (error) {
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
    if (currentArtistSignupFormIndex === 4) {
      if (artistSignupData.art_style === "") {
        toast.error("Error notification", {
          description: "Please select an art style",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
    }
    if (shouldDisableNext(isFieldDirty, currentArtistSignupFormIndex, steps)) {
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
    incrementCurrentArtistSignupFormIndex();
  };
  return (
    <div className="w-full flex px-3 gap-4">
      <button
        className={`${
          currentArtistSignupFormIndex > 0 ? "block" : "hidden"
        }   bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
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
        {currentArtistSignupFormIndex !== 1 && <MdOutlineArrowForward />}
      </button>
    </div>
  );
}
