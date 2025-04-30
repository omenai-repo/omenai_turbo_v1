import { stepperStore } from "@omenai/shared-state-store/src/stepper/stepperStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { validateCharge } from "@omenai/shared-services/subscriptions/subscribeUser/validateCharge";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "sonner";

export default function Oput({
  handleClick,
  set_id,
}: {
  handleClick: () => void;
  set_id: Dispatch<SetStateAction<string>>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const { flw_ref } = stepperStore();

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOtp(value);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otp === "" || otp.length < 4) {
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
    setIsLoading(true);

    const data = { otp, flw_ref };

    const response = await validateCharge(data);
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
        set_id(response.data.data.id);
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
  }

  return (
    <form
      className=" max-w-full flex flex-col space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-fluid-xs font-bold">OTP verification</h1>
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
          Enter OTP sent to your number or email
        </label>
        <input
          name="otp"
          type="text"
          required
          onChange={handleOtpChange}
          minLength={4}
          placeholder="Enter OTP"
          className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xxs placeholder:text-dark/40 "
        />
      </div>

      <div className="w-full">
        <button
          disabled={isLoading}
          type="submit"
          className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
