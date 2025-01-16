"use client";
import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";
import { country_and_states } from "@omenai/shared-json/src/countryAndStateList";
import { validateChargeAuthorization } from "@omenai/shared-services/subscriptions/subscribeUser/validateChargeAuthorization";
import { stepperStore } from "@omenai/shared-state-store/src/stepper/stepperStore";
import {
  FLWDirectChargeDataTypes,
  AvsAuthorizationData,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { hasEmptyString } from "@omenai/shared-utils/src/hasEmptyString";
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

  const [selectStates, setSelectStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    set_address_info((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
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
        state: "LA",
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
        console.log(response.data);
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

  useEffect(() => {
    const states = country_and_states.find(
      (country) => address_info.country === country.country
    );
    if (states) setSelectStates(states.states);
    else setSelectStates([]);
  }, [address_info.country]);

  return (
    <form
      className="flex flex-col space-y-3 w-full"
      onSubmit={submitAddressInfo}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-[14px] font-normal">Address verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      <div className="w-full">
        <label
          htmlFor={"country"}
          className="text-dark/80 font-normal text-[14px]"
        >
          Country
        </label>
        <select
          onChange={handleInputChange}
          required={true}
          name="country"
          className="border px-2 ring-0 text-[14px] text-dark border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-[14px] placeholder:text-[#858585] "
        >
          <option value="">Select Country</option>
          <>
            {country_codes.map((country: { code: string; name: string }) => {
              return (
                <option
                  key={country.code}
                  value={country.name}
                  className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
                >
                  {country.name}
                </option>
              );
            })}
          </>
        </select>
      </div>
      <div className="w-full">
        <label htmlFor={""} className="text-dark/80 font-normal text-[14px]">
          State
        </label>
        <select
          onChange={handleInputChange}
          disabled={address_info.country === ""}
          required={true}
          name="state"
          className="border px-2 ring-0 text-[14px] text-dark border-[#E0E0E0] disabled:cursor-not-allowed disabled:bg-[#fafafa] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-[14px] placeholder:text-[#858585] "
        >
          <option value="">Select State</option>
          <>
            {selectStates.map((state: any) => {
              return (
                <option
                  key={state}
                  value={state}
                  className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
                >
                  {state}
                </option>
              );
            })}
          </>
        </select>
      </div>
      <div className="relative w-full">
        <label
          className="text-[#858585] font-normal text-[14px] mb-2"
          htmlFor="city"
        >
          City
        </label>
        <input
          name="city"
          type="text"
          required
          onChange={handleInputChange}
          placeholder="e.g Lisbon"
          className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        />
      </div>
      <div className="relative w-full">
        <label
          className="text-[#858585] font-normal text-[14px] mb-2"
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
          className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        />
      </div>
      <div className="relative w-full">
        <label
          className="text-[#858585] font-normal text-[14px] mb-2"
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
          className="p-3 border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        />
      </div>

      <div className="w-full">
        <button
          type="submit"
          disabled={isLoading || hasEmptyString(address_info)}
          className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-[14px] bg-dark duration-200 grid place-items-center"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
