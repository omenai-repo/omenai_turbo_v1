"use client";
import AddressTextInput from "./AddressTextInput";
import { userDetails, userLocation } from "../AddressInputFieldMocks";
import AddressSelectInput from "./AddressSelectInput";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { FormEvent, useEffect, useState } from "react";
import { createShippingOrder } from "@omenai/shared-services/orders/createShippingOrder";
import { toast } from "sonner";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import {
  AddressTypes,
  IndividualSchemaTypes,
  RoleAccess,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { City, State } from "country-state-city";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

type AddressFormTypes = {
  userAddress: AddressTypes;
  author_id: string;
  art_id: string;
  availability: boolean;
  role_access: RoleAccess;
};
export default function AddressForm({
  userAddress,
  author_id,
  art_id,
  availability,
  role_access,
}: AddressFormTypes) {
  const { address, set_address_on_order } = orderStore();
  const {
    selectedCityList,
    setSelectedStateList,
    selectedStateList,
    setSelectedCityList,
    setSelectedCountry,
    selectedCountry,
    toggleOrderReceivedModal,
  } = actionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [save_shipping_address, setSaveShippingAddress] =
    useState<boolean>(false);

  const { user, csrf } = useAuth({ requiredRole: "user" });

  useEffect(() => {
    const address = user.address;
    setSelectedCountry(
      (address as AddressTypes).country,
      (address as AddressTypes).countryCode
    );
    const stateList = State.getStatesOfCountry(
      (address as AddressTypes).countryCode
    );

    const cityList = City.getCitiesOfState(
      (address as AddressTypes).countryCode,
      (address as AddressTypes).stateCode
    );

    setSelectedStateList(stateList);
    setSelectedCityList(cityList);
  }, []);

  async function handleOrderSubmission(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (allKeysEmpty(address)) {
      toast.error("Error notification", {
        description: "Please fill out the form completely",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
      return;
    }

    if (!availability) {
      toast.error("Error notification", {
        description: "This artwork is not available for purchase",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
    } else {
      const createdShippingOrder = await createShippingOrder(
        user?.user_id,
        art_id,
        author_id,
        save_shipping_address,
        address,
        null,
        role_access.role,
        csrf || ""
      );

      if (!createdShippingOrder!.isOk) {
        toast.error("Error notification", {
          description: createdShippingOrder!.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setLoading(false);
      } else {
        toggleOrderReceivedModal(true);
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <h1 className="text-fluid-sm font-semibold text-dark flex items-center gap-3">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Shipping Address
            </h1>
            <p className="text-fluid-xs text-slate-600 mt-1">
              Please confirm your delivery details
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleOrderSubmission} className="p-4">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wide">
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {userDetails.map((detail, index) => (
                  <div key={detail.name} className="space-y-2">
                    <AddressTextInput
                      placeholder={detail.placeholder}
                      label={detail.label}
                      name={detail.name}
                      type={detail.type}
                      required={detail.required}
                      disabled={true}
                      defaultValue={
                        detail.name === "name"
                          ? user.name || ""
                          : user.email || ""
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wide">
                Delivery Address
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {userLocation.map((location: any, index: number) => (
                  <div key={index} className="space-y-2">
                    {location.type === "select" ? (
                      <AddressSelectInput
                        label={location.label}
                        name={location.name}
                        items={location.items}
                        labelText={location.labelText}
                        defaultValue={
                          user.address?.[
                            location.labelText as keyof AddressTypes
                          ] ?? ""
                        }
                      />
                    ) : (
                      <AddressTextInput
                        placeholder={location.placeholder}
                        label={location.label}
                        name={location.labelText}
                        type={location.type}
                        required={true}
                        disabled={false}
                        defaultValue={
                          user?.address?.[
                            location.labelText as keyof AddressTypes
                          ] || ""
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Save Address Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="save_address"
                    id="save_address"
                    onChange={(e) => setSaveShippingAddress(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:border-dark peer-checked:bg-dark transition-colors">
                    <svg
                      className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-700 select-none">
                  Save this address for future orders
                </span>
              </label>

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 w-fit bg-dark text-white font-normal rounded-md shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 min-w-[180px] text-fluid-xs"
              >
                {!loading ? (
                  <span className="flex items-center justify-center gap-2">
                    Place Order request
                  </span>
                ) : (
                  <LoadSmall />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
