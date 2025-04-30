"use client";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import CardNumber from "./CardNumber";
import CVV from "./CardCvv";
import ExpiryMonth from "./CardExpiryMonth";
import ExpiryYear from "./CardExpiryYear";
import { initiateDirectCharge } from "@omenai/shared-services/subscriptions/subscribeUser/initiateDirectCharge";
import { toast } from "sonner";
import { notFound, useRouter, useSearchParams } from "next/navigation";

import { IoIosLock } from "react-icons/io";
import { useLocalStorage } from "usehooks-ts";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { stepperStore } from "@omenai/shared-state-store/src/stepper/stepperStore";
import {
  SubscriptionPlanDataTypes,
  CardInputTypes,
  FLWDirectChargeDataTypes,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { hasEmptyString } from "@omenai/shared-utils/src/hasEmptyString";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";

export default function CardInput({
  updateAuthorization,
  handleClick,
  plan,
}: {
  updateAuthorization: Dispatch<
    SetStateAction<"" | "redirect" | "pin" | "avs_noauth" | "otp">
  >;
  handleClick: () => void;
  plan: SubscriptionPlanDataTypes & { createdAt: string; updatedAt: string };
}) {
  const { update_flw_charge_payload_data } = stepperStore();
  const session = useSession();
  const url = getApiUrl();
  const router = useRouter();

  const searchParams = useSearchParams();
  const interval = searchParams.get("interval");
  const plan_object_id = searchParams.get("plan_id");
  const charge_type = searchParams.get("charge_type");
  const redirect = searchParams.get("redirect");
  const dashboard_uri = dashboard_url();
  const [transaction_id, set_transaction_id] = useLocalStorage(
    "flw_trans_id",
    ""
  );

  if (!interval || !plan_object_id) return notFound();
  const [card_info, set_card_info] = useState<CardInputTypes>({
    card: "",
    cvv: "",
    month: "",
    year: "",
    name: "",
  });

  const [cardInputLoading, setCardInputLoading] = useState(false);

  const handleCardDetailInputChange = (name: string, value: string) => {
    set_card_info((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  async function handleCardInputSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCardInputLoading(true);
    const ref = generateAlphaDigit(7);
    if (hasEmptyString(card_info))
      toast.error("Error notification", {
        description: "Some fields are empty, please fill all required fields",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      const data: FLWDirectChargeDataTypes & { name: string } = {
        ...card_info,
        year: card_info.year.slice(2, 4),
        tx_ref: ref,
        amount:
          charge_type === "card_change"
            ? "1"
            : interval === "monthly"
              ? plan.pricing.monthly_price
              : plan.pricing.annual_price,
        customer: {
          name: session?.name as string,
          email: session?.email as string,
          gallery_id: session?.gallery_id as string,
          plan_id: plan_object_id!,
          plan_interval: interval!,
        },
        redirect:
          redirect !== null
            ? `${dashboard_uri}${redirect}`
            : `${dashboard_uri}/gallery/billing/plans/checkout/verification`,
        charge_type,
      };

      const response = await initiateDirectCharge(data);
      if (response?.data) {
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
          if (response.data.status === "successful") {
            set_transaction_id(response.data.data.id);
            router.replace("/gallery/billing/plans/checkout/verification");
            return;
          }
          if (response.data.meta.authorization.mode === "redirect") {
            toast.info("Redirecting to authentication portal, Please wait");
            set_transaction_id(response.data.data.id);
            router.replace(response.data.meta.authorization.redirect);
            // redirect user
          } else {
            updateAuthorization(response.data.meta.authorization.mode);
          }
          handleClick();
        }
        update_flw_charge_payload_data(data);
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
    }

    setCardInputLoading(false);

    // should be moved to the success response
  }
  return (
    <form className="space-y-4" onSubmit={handleCardInputSubmit}>
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-xs font-bold">Payment Method</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>

      <div className="relative w-full ">
        <label className="text-[#858585] text-[13px]" htmlFor="card_name">
          Card name
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="Enter the name on your card"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleCardDetailInputChange(e.target.name, e.target.value)
          }
          className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xxs placeholder:text-dark/40 "
        />
      </div>
      <CardNumber onChange={handleCardDetailInputChange} />

      <div className="grid grid-cols-3 gap-x-2 justify-center">
        <ExpiryMonth onChange={handleCardDetailInputChange} />
        <ExpiryYear onChange={handleCardDetailInputChange} />
        <CVV onChange={handleCardDetailInputChange} />
      </div>
      <div className="w-full mt-10">
        <button
          type="submit"
          disabled={cardInputLoading}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {cardInputLoading ? <LoadSmall /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
