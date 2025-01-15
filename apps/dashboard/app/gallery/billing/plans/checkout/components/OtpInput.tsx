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
        <h1 className="text-[14px] font-normal">OTP verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      <div className="relative w-full">
        <label
          className="text-[#858585] font-normal text-[13px] mb-4"
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
          className="h-[40px] border border-[#E0E0E0] text-[13px] placeholder:text-[#858585] placeholder:text-[13px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        />
      </div>

      <div className="w-full">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-[13px] bg-dark duration-200 grid place-items-center"
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
