"use client";
import React, { useState } from "react";
import { AlertCircle, MapPin } from "lucide-react";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import Input from "@omenai/shared-ui-components/components/artists/AddressInputHandler";
import SelectInput from "@omenai/shared-ui-components/components/global/AddressSelectHandler";
import { artist_countries_codes_currency } from "@omenai/shared-json/src/artist_onboarding_countries";
import { AddressTypes } from "@omenai/shared-types";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { updateAddress } from "@omenai/shared-services/update/artist/updateAddress";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { useRollbar } from "@rollbar/react";
import AlertComponent from "@omenai/shared-ui-components/components/modal/AlertComponent";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
export const artist_signup_step_two = [
  {
    label: "Country of residence",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: artist_countries_codes_currency,
  },
  {
    label: "State",
    type: "select",
    labelText: "state",
    placeholder: "Select option",
    items: [],
  },
  {
    label: "City",
    type: "select",
    placeholder: "Select option",
    labelText: "city",
    items: [],
  },
  {
    label: "Address line",
    type: "text",
    placeholder: "e.g 79, example street",
    labelText: "address_line",
    items: [],
  },
  {
    label: "Postal code",
    type: "text",
    placeholder: "Your region's postal code",
    labelText: "zip",
  },
];

export default function UpdateAddressModalForm() {
  const queryClient = useQueryClient();
  const { updateAddressModalPopup } = artistActionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<AddressTypes>({
    address_line: "",
    city: "",
    country: "",
    state: "",
    countryCode: "",
    stateCode: "",
    zip: "",
  });
  const [base_currency, set_base_currency] = useState<string>("");
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const rollbar = useRollbar();

  const router = useRouter();
  const handleAddressUpdate = async () => {
    setLoading(true);
    try {
      if (allKeysEmpty({ ...address, base_currency })) {
        toast_notif("Please fill all fields to proceed", "error");
        return;
      }

      const updateAddressResponse = await updateAddress(
        user.artist_id,
        address,
        base_currency,
        csrf || "",
      );

      if (!updateAddressResponse.isOk) {
        toast_notif(
          updateAddressResponse.message ||
            "Something went wrong, please try again or contact support",
          "error",
        );
        return;
      }
      toast_notif(
        `${updateAddressResponse.message || "Address information updated successfully"}`,
        "success",
      );
      await queryClient.invalidateQueries({
        queryKey: ["fetch_artist_info"],
        exact: false,
      });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error",
      );
    } finally {
      setLoading(false);
      updateAddressModalPopup(false);
    }
  };

  return (
    <div className="bg-white rounded max-w-lg w-full p-6 shadow-2xl animate-slideUp  max-h-[90vh] overflow-y-auto h-auto">
      <h3 className="text-fluid-sm font-semibold text-dark mb-6">
        Update Address
      </h3>
      <div className="flex flex-col space-y-6">
        {artist_signup_step_two.map((form_step, index) => {
          return (
            <div key={index}>
              {form_step.type === "select" ? (
                <SelectInput
                  label={form_step.label}
                  items={
                    form_step.items as {
                      name: string;
                      alpha2: string;
                      alpha3: string;
                      currency: string;
                    }[]
                  }
                  name={form_step.label}
                  required={false}
                  labelText={form_step.labelText}
                  onChange={setAddress}
                  address={address}
                  updateCurrency={set_base_currency}
                />
              ) : (
                <Input
                  label={form_step.label}
                  type={form_step.type}
                  placeholder={form_step.placeholder}
                  buttonType={"button"}
                  buttonText={"Continue"}
                  labelText={form_step.labelText}
                  onChange={setAddress}
                  address={address}
                />
              )}
            </div>
          );
        })}
      </div>
      <AlertComponent title="Please note:">
        Changing your address will only apply to future orders. Any orders that
        are currently being processed will be picked up from your current
        Address.
      </AlertComponent>
      <div className="flex space-x-3 pt-2 mt-4">
        <button
          onClick={() => updateAddressModalPopup(false)}
          className="flex h-10 w-full items-center justify-center gap-3 bg-white text-dark font-light text-fluid-xs transition-all duration-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleAddressUpdate}
          disabled={loading || allKeysEmpty({ ...address, base_currency })}
          className={BUTTON_CLASS}
        >
          {loading ? (
            <LoadSmall />
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Update Address</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
