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
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

type AddressFormProps = {
  userAddress: AddressTypes;
  author_id: string;
  art_id: string;
  availability: boolean;
  role_access: RoleAccess;
};

export default function AddressForm({
  author_id,
  art_id,
  availability,
  role_access,
}: AddressFormProps) {
  const { address, set_address_on_order } = orderStore();

  const {
    setSelectedStateList,
    setSelectedCityList,
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
      user.user_id,
      art_id,
      author_id,
      saveShippingAddress,
      address,
      null,
      role_access.role,
      csrf ?? ""
    );

    if (!createdShippingOrder?.isOk) {
      toast_notif(
        createdShippingOrder.message ||
          "There was a problem placing this order request, please try again or contact support",
        "error"
      );
      return setLoading(false);
    }

    toggleOrderReceivedModal(true);
    setLoading(false);
  }

  return (
    <div className="w-full">
      <form onSubmit={handleOrderSubmission} className="space-y-12">
        {/* SECTION 1: Personal Info */}
        <section>
          <div className="mb-6 border-b border-black pb-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-dark">
              I. Collector Information
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
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

        {/* SECTION 2: Delivery Address */}
        <section>
          <div className="mb-6 border-b border-black pb-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-dark">
              II. Destination
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
            {userLocation.map((location: any, index: number) => (
              <div key={index} className="w-full">
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

        {/* FOOTER ACTIONS */}
        <footer className="pt-8">
          <div className="flex items-center gap-3 mb-8">
            <input
              type="checkbox"
              id="save-address"
              className="accent-black h-4 w-4 rounded-none border-neutral-300"
              onChange={(e) => setSaveShippingAddress(e.target.checked)}
            />
            <label
              htmlFor="save-address"
              className="cursor-pointer font-sans text-xs text-neutral-600 select-none"
            >
              Save this address for future acquisitions
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-white h-14 font-mono text-xs uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-none"
          >
            {loading ? <LoadSmall /> : "Submit Purchase Request"}
          </button>

          <p className="mt-4 text-center font-sans text-[10px] text-neutral-400">
            By submitting, you agree to Omenai’s Terms of Sale.
          </p>
        </footer>
      </form>
    </div>
  );
}
