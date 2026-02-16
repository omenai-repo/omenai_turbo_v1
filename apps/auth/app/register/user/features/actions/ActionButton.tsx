import { validateAddress } from "@omenai/shared-services/address_validation/validateAddress";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { useRollbar } from "@rollbar/react";
import React, { useState } from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { toast } from "sonner";
const steps = {
  0: ["name", "email"],
  1: ["country", "address_line", "state", "city", "zip"],
  2: ["password", "confirmPassword"],
};
export default function ({
  preference_chosen = true,
}: {
  preference_chosen?: boolean;
}) {
  const {
    currentSignupFormIndex,
    decrementCurrentSignupFormIndex,
    incrementCurrentSignupFormIndex,
    isFieldDirty,
    individualSignupData,
  } = useIndividualAuthStore();

  const [loading, setLoading] = useState<boolean>(false);
  const rollbar = useRollbar();

  const validateAddressCapability = async () => {
    if (individualSignupData.phone === "") {
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
      type: "delivery" as "delivery" | "pickup",
      countryCode: individualSignupData.countryCode,
      postalCode: individualSignupData.zip,
      cityName: individualSignupData.state,
      countyName: individualSignupData.city,
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
            "Address verification for delivery capability was successful",
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
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

  const error_toast = (message: string) => {
    toast.error("Error notification", {
      description: message,
      style: {
        background: "red",
        color: "white",
      },
      className: "class",
    });
  };
  const handleClickPrev = () => {
    decrementCurrentSignupFormIndex();
  };
  const handleClickNext = () => {
    if (currentSignupFormIndex === 1) {
      if (
        individualSignupData.password !== individualSignupData.confirmPassword
      ) {
        error_toast("Passwords do not match");
        return;
      }
    }
    if (currentSignupFormIndex === 3 && !preference_chosen) {
      error_toast("Please select up to 5 art preferences");
      return;
    }
    if (currentSignupFormIndex !== 3) {
      if (shouldDisableNext(isFieldDirty, currentSignupFormIndex, steps)) {
        error_toast("Invalid field values");
        return;
      }
    }

    incrementCurrentSignupFormIndex();
  };
  return (
    <div className="mt-6 flex gap-4">
      <button
        className={`${
          currentSignupFormIndex > 0 ? "block" : "hidden"
        }  ${BUTTON_CLASS}`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className={BUTTON_CLASS}
        type={"button"}
        disabled={currentSignupFormIndex === 0 && isFieldDirty["phone"]}
        onClick={handleClickNext}
      >
        Continue
        {/* <span>
          {loading ? (
            <LoadSmall />
          ) : currentSignupFormIndex === 1 ? (
            "Verify Address"
          ) : (
            "Continue"
          )}
        </span> */}
      </button>
    </div>
  );
}
