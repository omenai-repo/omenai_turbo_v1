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
      <div className="w-full my-[1rem]">
        <h1 className="my-6 text-fluid-xs font-medium">Address Information</h1>
        <form onSubmit={handleOrderSubmission}>
          <div className="grid xl:grid-cols-2 gap-y-2 gap-x-4">
            {userDetails.map((detail, index) => {
              return (
                <AddressTextInput
                  key={detail.name}
                  placeholder={detail.placeholder}
                  label={detail.label}
                  name={detail.name}
                  type={detail.type}
                  required={detail.required}
                  disabled={true}
                  defaultValue={
                    detail.name === "name" ? user.name || "" : user.email || ""
                  }
                />
              );
            })}
          </div>
          <div className="grid xl:grid-cols-2 gap-y-2 gap-x-4">
            {userLocation.map((location: any, index: number) => {
              return location.type === "select" ? (
                <AddressSelectInput
                  key={index}
                  label={location.label}
                  name={location.name}
                  items={location.items}
                  labelText={location.labelText}
                  defaultValue={
                    user.address?.[location.labelText as keyof AddressTypes] ??
                    ""
                  }
                />
              ) : (
                <AddressTextInput
                  key={location.labelText}
                  placeholder={location.placeholder}
                  label={location.label}
                  name={location.labelText}
                  type={location.type}
                  required={true}
                  disabled={false}
                  defaultValue={
                    user?.address?.[location.labelText as keyof AddressTypes] ||
                    ""
                  }
                />
              );
            })}
          </div>

          <div className="flex lg:flex-row flex-col sm:justify-between sm:items-center mt-2">
            <div className="my-5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="save address"
                  id="save_address"
                  onChange={(e) => setSaveShippingAddress(e.target.checked)}
                />
                <label htmlFor="age" className="text-fluid-xs">
                  Save my address
                </label>
              </div>
            </div>
            <div className="w-fit my-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-full h-[35px] p-5 text-fluid-xs disabled:cursor-not-allowed disabled:bg-white disabled:border disabled:border-dark bg-dark text-white duration-300 hover:underline flex items-center justify-center"
              >
                {!loading ? "Place this order" : <LoadSmall />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
