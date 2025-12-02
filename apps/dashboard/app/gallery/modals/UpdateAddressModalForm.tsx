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
import { updateAddress } from "@omenai/shared-services/update/gallery/updateAddress";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { galleryActionStore } from "@omenai/shared-state-store/src/gallery/gallery_actions/GalleryActionStore";
import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";
import { useRollbar } from "@rollbar/react";
import AlertComponent from "@omenai/shared-ui-components/components/modal/AlertComponent";

export const address_inputs = [
  {
    label: "Country of residence",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: country_codes,
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
  const { updateAddressModalPopup } = galleryActionStore();
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
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();

  const router = useRouter();
  const handleAddressUpdate = async () => {
    setLoading(true);
    try {
      if (allKeysEmpty({ ...address })) {
        toast_notif("Please fill all fields to proceed", "error");
        return;
      }

      const updateAddressResponse = await updateAddress(
        user.gallery_id,
        address,
        csrf || ""
      );

      if (!updateAddressResponse.isOk) {
        toast_notif(
          updateAddressResponse.message ||
            "Something went wrong, please try again or contact support",
          "error"
        );
        return;
      }
      toast_notif(
        `${updateAddressResponse.message || "Address information updated successfully"}. Please refresh your page`,
        "success"
      );
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error"
      );

      await queryClient.invalidateQueries({
        queryKey: ["fetch_gallery_info"],
        exact: false,
      });
      router.refresh();
    } finally {
      setLoading(false);
      updateAddressModalPopup(false);
    }
  };

  return (
    <div className="bg-white rounded max-w-lg w-full p-6 shadow-2xl animate-slideUp max-h-[85vh] h-auto overflow-y-auto">
      <h3 className="text-fluid-sm font-semibold text-dark mb-6">
        Update Address
      </h3>
      <div className="flex flex-col space-y-6">
        {address_inputs.map((form_step, index) => {
          return (
            <div key={index}>
              {form_step.type === "select" ? (
                <SelectInput
                  label={form_step.label}
                  items={
                    form_step.items as {
                      name: string;
                      code: string;
                    }[]
                  }
                  name={form_step.label}
                  required={false}
                  labelText={form_step.labelText}
                  onChange={setAddress}
                  address={address}
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
          className="flex-1 px-4 py-2 bg-gray-300 text-dark rounded hover:bg-gray-400 
                       transition-all duration-300 text-fluid-xxs font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleAddressUpdate}
          disabled={loading || allKeysEmpty({ ...address })}
          className="flex-1 px-4 py-2 bg-dark text-white rounded hover:bg-dark/90 
          disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-dark/30
                             transition-all duration-300 text-fluid-xxs font-medium flex items-center justify-center space-x-2"
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
