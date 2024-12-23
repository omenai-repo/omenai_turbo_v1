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
        <h1 className="text-xs font-normal">Pin Verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      <div className="relative w-full">
        <label
          className="text-[#858585] font-normal text-xs mb-4"
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
          className="p-3 border border-[#E0E0E0] text-xs placeholder:text-[#858585] placeholder:text-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        />
      </div>

      <div className="w-full">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-xs bg-dark duration-200 grid place-items-center"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
