"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { validateChargeAuthorization } from "@omenai/shared-services/subscriptions/subscribeUser/validateChargeAuthorization";
import { stepperStore } from "@omenai/shared-state-store/src/stepper/stepperStore";
import {
  FLWDirectChargeDataTypes,
  PinAuthorizationData,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export default function AuthPinInput({
  handleClick,
  updateFinalAuthorization,
}: {
  handleClick: () => void;
  updateFinalAuthorization: Dispatch<
    SetStateAction<"" | "redirect" | "pin" | "avs_noauth" | "otp">
  >;
}) {
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { flw_charge_payload, update_flw_charge_payload_data, set_flw_ref } =
    stepperStore();
  const [auth_data, set_auth_data] = useState<{
    mode: "pin" | "avs_noauth" | "otp";
    pin: string;
  }>({
    mode: "pin",
    pin: "",
  });

  const [transaction_id, set_transaction_id] = useLocalStorage(
    "flw_trans_id",
    ""
  );

  const handlePinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const numbersOnly = value.replace(/\D/g, ""); // Remove non-numeric characters

    set_auth_data((prev) => ({ ...prev, pin: numbersOnly }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (auth_data.pin === "" || auth_data.pin.length < 4) {
      toast.error("Error notification", {
        description: "Invalid input parameter",
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
      authorization: PinAuthorizationData;
    } = {
      authorization: {
        mode: "pin",
        pin: auth_data.pin,
      },
      ...flw_charge_payload,
      tx_ref: ref,
    };

    setIsLoading(true);

    const response = await validateChargeAuthorization(data, csrf || "");
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
          // redirect user
          toast.info("Operation in progress", {
            description: "Redirecting to authentication portal, Please wait",
          });
          set_transaction_id(response.data.data.id);
          router.replace(response.data.meta.authorization.redirect);
        } else {
          set_flw_ref(response.data.data.flw_ref);
          updateFinalAuthorization(response.data.meta.authorization.mode);
        }
        handleClick();
      }
    } else {
      toast.error("Error notification", {
        description: "Something went wrong, please try again",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setIsLoading(false);
  }
  return (
    <form
      className="max-w-full flex flex-col space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-fluid-base font-bold">Pin Verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      <div className="relative w-full flex flex-col">
        <label
          className="text-[#858585] font-medium text-fluid-xxs mb-4"
          htmlFor="otp"
        >
          Enter your 4-digit pin
        </label>
        <input
          name="pin"
          type="password"
          required
          placeholder="****"
          onChange={handlePinChange}
          maxLength={4}
          minLength={4}
          value={auth_data.pin}
          className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-xl placeholder:text-dark/40 placeholder:text-fluid-xs"
        />
      </div>

      <div className="w-full">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[35px] p-5 rounded-xl w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
