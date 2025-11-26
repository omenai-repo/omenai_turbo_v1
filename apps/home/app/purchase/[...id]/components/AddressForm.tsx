"use client";

import AddressTextInput from "./AddressTextInput";
import AddressSelectInput from "./AddressSelectInput";

import { userDetails, userLocation } from "../AddressInputFieldMocks";

import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

import { createShippingOrder } from "@omenai/shared-services/orders/createShippingOrder";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";

import { AddressTypes, RoleAccess } from "@omenai/shared-types";

import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

import { City, State } from "country-state-city";
import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";

type AddressFormProps = {
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
}: AddressFormProps) {
  const { address, set_address_on_order } = orderStore();

  const {
    selectedCityList,
    setSelectedStateList,
    selectedStateList,
    setSelectedCityList,
    selectedCountry,
    setSelectedCountry,
    toggleOrderReceivedModal,
  } = actionStore();

  const { user, csrf } = useAuth({ requiredRole: "user" });

  const [loading, setLoading] = useState(false);
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);

  useEffect(() => {
    if (!user?.address) return;

    const addr = user.address as AddressTypes;

    setSelectedCountry(addr.country, addr.countryCode);

    const states = State.getStatesOfCountry(addr.countryCode);
    const cities = City.getCitiesOfState(addr.countryCode, addr.stateCode);

    setSelectedStateList(states);
    setSelectedCityList(cities);
  }, [user]);

  async function handleOrderSubmission(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (allKeysEmpty(address)) {
      toast.error("Incomplete Form", {
        description: "Please fill out all required address fields.",
      });
      return setLoading(false);
    }

    if (!availability) {
      toast.error("Artwork Unavailable", {
        description: "This artwork is currently unavailable for purchase.",
      });
      return setLoading(false);
    }

    const createdShippingOrder = await createShippingOrder(
      user?.user_id,
      art_id,
      author_id,
      saveShippingAddress,
      address,
      null,
      role_access.role,
      csrf ?? ""
    );

    if (!createdShippingOrder?.isOk) {
      toast.error("Order Failed", {
        description: createdShippingOrder.message,
      });
      return setLoading(false);
    }

    toggleOrderReceivedModal(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <header className="bg-slate-50 p-5 border-b border-slate-200">
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
          <p className="text-fluid-xxs text-slate-600 mt-1">
            Please confirm your delivery details below.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleOrderSubmission} className="p-6 space-y-10">
          {/* Personal Info */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
              Personal Information
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {userDetails.map((detail) => (
                <AddressTextInput
                  key={detail.name}
                  placeholder={detail.placeholder}
                  label={detail.label}
                  name={detail.name}
                  type={detail.type}
                  required={detail.required}
                  disabled
                  defaultValue={detail.name === "name" ? user.name : user.email}
                />
              ))}
            </div>
          </section>

          {/* Delivery Address */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
              Delivery Address
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
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
          </section>

          {/* Footer Actions */}
          <footer className="border-t border-slate-200 pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Save Address */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                onChange={(e) => setSaveShippingAddress(e.target.checked)}
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded-sm flex items-center justify-center peer-checked:bg-dark peer-checked:border-dark transition">
                <svg
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-slate-700">
                Save this address for future orders
              </span>
            </label>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 min-w-[180px] bg-dark text-white rounded shadow-sm text-fluid-xxs grid place-items-center transition-all active:scale-95 disabled:bg-dark/30 disabled:cursor-not-allowed"
            >
              {loading ? <LoadSmall /> : "Place Order Request"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
