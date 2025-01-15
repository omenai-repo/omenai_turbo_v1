"use client";

import PricingCardFeatureListItem from "./PricingCardFeatureListItem";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { useLocalStorage } from "usehooks-ts";
import { getApiUrl, auth_uri } from "@omenai/url-config/src/config";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

type PricingCardItemProps = {
  plan: string;
  price: string;
  features: string[];
  duration?: string;
  description?: string;
};
export default function PricingCardItem({
  plan,
  price,
  duration,
  description,
  features,
}: PricingCardItemProps) {
  const [loading, setLoading] = useState(false);
  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );
  const url = getApiUrl();
  const router = useRouter();
  const { session } = useContext(SessionContext);
  const auth_url = auth_uri();
  async function handleSubscribe() {
    if (
      session === undefined ||
      (session && (session as GallerySchemaTypes).role !== "gallery")
    ) {
      set_redirect_uri(`${url}/gallery/pricing`);
      toast.error("Error notification", {
        description: "Login to your gallery account",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      router.push(`${auth_url}/login`);
    } else {
      setLoading(true);
      const response = await fetch("/api/subscriptions/subscribeUser", {
        method: "POST",
        body: JSON.stringify({
          email: session.email,
          name: session.name,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error("Error notification", {
          description: result.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setLoading(false);
      } else {
        // TODO: Check this properly, this might be a bug
        if (result.data.type === "sub_activated") {
          toast.success("Operation successful", {
            description: result.message,
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          router.push("/dashboard/gallery/subscription");
        } else {
          toast.success("Operation successful", {
            description: "Payment link generated...redirecting",
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          const link = result.data.link;
          setLoading(false);
          router.push(link);
        }
      }
    }
  }

  return (
    <div className="w-fit rounded-lg text-dark border border-dark/20 shadow-sm">
      {/* Plan name and popularity tag (optional) */}
      <div className="p-8 w-full flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <p className="font-normal">{plan} plan</p>
          {/* <div className="border border-primary rounded-full px-2 py-[0.1rem]">
            <span className="text-[14px] text-primary font-normal">popular</span>
          </div> */}
        </div>
        {/* Plan price */}
        <div className="w-full flex gap-1 items-center">
          <p className="text-xl font-normal">{price}</p>
          <p className="text-base">{duration}</p>
        </div>
        {/* Plan description if applicable */}
        <div className="w-full">
          <p className="font-light text-[14px]">{description}</p>
        </div>
        {/* Action buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={handleSubscribe}
            className={`bg-primary rounded-md w-full py-2 grid place-items-center disabled:bg-gray-400 disabled:text-dark disabled:cursor-pointer text-white`}
          >
            {loading ? <LoadSmall /> : "Subscribe"}
          </button>
        </div>
      </div>
      {/* Divider */}
      <hr className="border-dark/20" />

      {/* Features */}
      <div className="flex-col flex gap-2 p-8">
        <h6 className="font-normal text-sm">Features</h6>
        <span className="text-[14px] font-light">
          Everything in the <span className="font-normal">{plan}</span> plan
          plus...
        </span>
        <div className="w-full mt-4">
          <ul className="flex flex-col gap-3 list-none">
            {features.map((feature, index) => {
              return (
                <PricingCardFeatureListItem
                  key={feature}
                  feature_title={feature}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
