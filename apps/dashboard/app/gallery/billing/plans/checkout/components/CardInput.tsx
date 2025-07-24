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
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { LockKeyhole, Shield } from "lucide-react";

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
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
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
          name: user.name as string,
          email: user.email as string,
          gallery_id: user.gallery_id as string,
          plan_id: plan_object_id!,
          plan_interval: interval!,
        },
        redirect:
          redirect !== null
            ? `${dashboard_uri}${redirect}`
            : `${dashboard_uri}/gallery/billing/plans/checkout/verification`,
        charge_type,
      };

      const response = await initiateDirectCharge(data, csrf || "");
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
    <form className="max-w-full" onSubmit={handleCardInputSubmit}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h1 className="text-fluid-sm font-bold text-gray-900">
            Payment Method
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <LockKeyhole size={20} strokeWidth={1.5} absoluteStrokeWidth />
            <span className="text-fluid-xs font-medium text-green-700">
              Secure form
            </span>
          </div>
        </div>

        {/* Card Name */}
        <div className="relative w-full">
          <label
            className="block text-sm font-medium text-gray-600 mb-2"
            htmlFor="card_name"
          >
            Cardholder name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Enter the name on your card"
            onChange={(e) =>
              handleCardDetailInputChange(e.target.name, e.target.value)
            }
            className="w-full h-12 px-4 text-sm font-medium bg-white border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all duration-200 placeholder:text-dark/30 outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          />
        </div>

        {/* Card Number */}
        <CardNumber onChange={handleCardDetailInputChange} />

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <ExpiryMonth onChange={handleCardDetailInputChange} />
          <ExpiryYear onChange={handleCardDetailInputChange} />
          <CVV onChange={handleCardDetailInputChange} />
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Your payment is secured
            </p>
            <p className="text-xs text-blue-700 mt-1">
              We use industry-standard encryption to protect your information
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={cardInputLoading}
            className="w-full h-12 bg-dark text-white text-fluid-xs font-semibold rounded-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-3"
          >
            {cardInputLoading ? <LoadSmall /> : "Complete Payment"}
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center gap-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-8 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold text-[10px]">
              VISA
            </div>
            <span>Visa</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-8 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white font-bold text-[10px]">
              MC
            </div>
            <span>Mastercard</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-8 h-5 bg-blue-500 rounded-sm flex items-center justify-center text-white font-bold text-[10px]">
              AMEX
            </div>
            <span>Amex</span>
          </div>
        </div>
      </div>
    </form>
  );
}
