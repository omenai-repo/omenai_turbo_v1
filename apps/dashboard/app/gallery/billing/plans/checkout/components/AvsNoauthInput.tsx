"use client";
import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";
import { validateChargeAuthorization } from "@omenai/shared-services/subscriptions/subscribeUser/validateChargeAuthorization";
import { stepperStore } from "@omenai/shared-state-store/src/stepper/stepperStore";
import {
  FLWDirectChargeDataTypes,
  AvsAuthorizationData,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { hasEmptyString } from "@omenai/shared-utils/src/hasEmptyString";
import { City, ICity, IState, State } from "country-state-city";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export default function AvsNoauthInput({
  handleClick,
  updateFinalAuthorization,
}: {
  handleClick: () => void;
  updateFinalAuthorization: Dispatch<
    SetStateAction<"" | "redirect" | "pin" | "avs_noauth" | "otp">
  >;
}) {
  const [address_info, set_address_info] = useState<{
    city: string;
    address: string;
    zipcode: string;
    state: string;
    country: string;
  }>({
    city: "",
    address: "",
    zipcode: "",
    state: "",
    country: "",
  });

  const { flw_charge_payload, update_flw_charge_payload_data } = stepperStore();

  const [transaction_id, set_transaction_id] = useLocalStorage(
    "flw_trans_id",
    ""
  );

  const [selectStates, setSelectStates] = useState<IState[]>([]);
  const [selectedCities, setSelectedCities] = useState<ICity[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const selectedCode =
      name === "country" || name === "state"
        ? (e.target as HTMLSelectElement).options[
            (e.target as HTMLSelectElement).selectedIndex
          ].getAttribute("data-code")
        : "";
    set_address_info((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });

    if (name === "country") {
      setSelectedCities([]);
      const stateList = State.getStatesOfCountry(selectedCode as string);
      setSelectStates(stateList);
      setSelectedCountryCode(selectedCode as string);
    }
    if (name === "state") {
      const cities = City.getCitiesOfState(
        selectedCountryCode,
        selectedCode as string
      );
      setSelectedCities(cities);
    }
  };

  const submitAddressInfo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const countryCode = country_codes.find(
      (country) => country.name === address_info.country
    );
    const updated_address_info = {
      ...address_info,
      country: countryCode?.code,
    };
    if (hasEmptyString(updated_address_info)) {
      toast.error("Error notification", {
        description: "Invalid input parameters",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    const ref = generateAlphaDigit(7);

    const data: FLWDirectChargeDataTypes & {
      authorization: AvsAuthorizationData;
    } = {
      authorization: {
        mode: "avs_noauth",
        ...updated_address_info,
      },
      ...flw_charge_payload,
      tx_ref: ref,
    };

    setIsLoading(true);

    const response = await validateChargeAuthorization(data);
    if (response?.isOk) {
      if (response.data.status === "error") {
        toast.error("Error notification", {
          description: response.data.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      } else {
        update_flw_charge_payload_data(
          {} as FLWDirectChargeDataTypes & { name: string }
        );
        if (response.data.meta.authorization.mode === "redirect") {
          toast.info("Redirecting to authentication portal, Please wait");
          set_transaction_id(response.data.data.id);
          router.replace(response.data.meta.authorization.redirect);
          // redirect user
        } else {
          updateFinalAuthorization(response.data.meta.authorization.mode);
        }
        handleClick();
      }
    } else {
      toast.error("Error notification", {
        description: "Something went wrong",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setIsLoading(false);
  };

  return (
    <form
      className="flex flex-col space-y-3 w-full"
      onSubmit={submitAddressInfo}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-fluid-base font-bold">Address verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      {/* Country select */}
      <div className="w-full  flex flex-col gap-y-2">
        <label
          htmlFor={"country"}
          className="text-dark/80 font-normal text-fluid-xs"
        >
          Country
        </label>
        <select
          onChange={handleInputChange}
          required={true}
          name="country"
          className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-fluid-xs placeholder:text-dark/40"
        >
          <option value="">Select Country</option>
          <>
            {country_codes.map((country: { code: string; name: string }) => {
              return (
                <option
                  key={country.code}
                  value={country.name}
                  data-code={country.code}
                  className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                >
                  {country.name}
                </option>
              );
            })}
          </>
        </select>
      </div>
      {/* State select */}
      <div className="w-full flex flex-col gap-y-2">
        <label htmlFor={""} className="text-dark/80 font-normal text-fluid-xs">
          State
        </label>
        <select
          onChange={handleInputChange}
          disabled={address_info.country === ""}
          required={true}
          name="state"
          className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-fluid-xs placeholder:text-dark/40"
        >
          <option value="">Select State</option>
          <>
            {selectStates.map((state: IState) => {
              return (
                <option
                  key={state.isoCode}
                  value={state.name}
                  data-code={state.isoCode}
                  className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                >
                  {state.name}
                </option>
              );
            })}
          </>
        </select>
      </div>
      {/* City select */}
      <div className="w-full flex flex-col gap-y-2">
        <label htmlFor={""} className="text-dark/80 font-normal text-fluid-xs">
          City
        </label>
        <select
          onChange={handleInputChange}
          disabled={address_info.country === "" || address_info.state === ""}
          required={true}
          name="city"
          className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-fluid-xs placeholder:text-dark/40"
        >
          <option value="">Select City</option>
          <>
            {selectedCities.map((city: ICity) => {
              return (
                <option
                  key={city.name}
                  value={city.name}
                  className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                >
                  {city.name}
                </option>
              );
            })}
          </>
        </select>
      </div>

      <div className="relative w-full flex flex-col gap-y-1">
        <label
          className="text-[#858585] font-normal text-fluid-xs mb-2"
          htmlFor="otp"
        >
          Address
        </label>
        <input
          name="address"
          type="text"
          required
          onChange={handleInputChange}
          placeholder="e.g 7, example street"
          className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xs placeholder:text-dark/40 "
        />
      </div>
      <div className="relative w-fullS flex flex-col gap-y-1">
        <label
          className="text-[#858585] font-normal text-fluid-xs mb-2"
          htmlFor="zipcode"
        >
          Zipcode
        </label>
        <input
          name="zipcode"
          type="text"
          required
          onChange={handleInputChange}
          placeholder="ZIP"
          className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xs placeholder:text-dark/40 "
        />
      </div>

      <div className="w-full">
        <button
          type="submit"
          disabled={isLoading || hasEmptyString(address_info)}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
