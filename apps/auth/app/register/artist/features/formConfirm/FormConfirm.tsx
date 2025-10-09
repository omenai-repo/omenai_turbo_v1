"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { Checkbox, Label } from "flowbite-react";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { base_url } from "@omenai/url-config/src/config";

export default function FormConfirm() {
  const { decrementCurrentArtistSignupFormIndex, isLoading } =
    useArtistAuthStore();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [mailingConsent, setMailingConsent] = useState(false);

  const canProceed = termsAccepted && policyAccepted;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ y: -100 }}
      transition={{ duration: 0.33 }}
    >
      <p className="text-fluid-xxs my-4 font-normal text-dark/80">
        Review the following terms and confirm your agreement to proceed with
        account creation
      </p>

      <div className="bg-white border border-dark/10 rounded-lg p-6 my-6">
        <h3 className="text-fluid-xxs font-semibold text-dark mb-4">
          Platform Terms
        </h3>

        <ul className="space-y-3 text-fluid-xxs text-dark/70 mb-6">
          <li className="flex items-start gap-3">
            <span className="text-dark font-medium mt-0.5">•</span>
            <span>
              A 35% commission applies to all artwork sales, covering marketing,
              platform visibility, payment processing, shipping coordination,
              and dedicated customer support.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-dark font-medium mt-0.5">•</span>
            <span>
              All artists must complete a verification process before gaining
              access to platform features. This ensures quality and authenticity
              across our creative community.
            </span>
          </li>
        </ul>

        <div className="space-y-4 pt-4 border-t border-dark/10">
          <div className="flex items-start gap-3">
            <Checkbox
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTermsAccepted(e.target.checked)
              }
              checked={termsAccepted}
              id="terms-confirmation"
              className="mt-0.5 border-dark/30 focus:ring-dark"
            />
            <Label
              htmlFor="terms-confirmation"
              className="text-dark/80 text-fluid-xxs font-normal cursor-pointer"
            >
              I have reviewed and accept the terms outlined above
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPolicyAccepted(e.target.checked)
              }
              checked={policyAccepted}
              id="policy-acceptance"
              className="mt-0.5 border-dark/30 focus:ring-dark"
            />
            <Label
              htmlFor="policy-acceptance"
              className="text-dark/80 text-fluid-xxs font-normal cursor-pointer"
            >
              I accept Omenai's{" "}
              <Link
                href={`${base_url()}/legal?ent=artist`}
                target="__blank"
                className="underline font-medium text-dark"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href={`${base_url()}/privacy`}
                target="__blank"
                className="underline font-medium text-dark"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMailingConsent(e.target.checked)
              }
              checked={mailingConsent}
              id="mailing-consent"
              className="mt-0.5 border-dark/30 focus:ring-dark"
            />
            <Label
              htmlFor="mailing-consent"
              className="text-dark/80 text-fluid-xxs font-normal cursor-pointer"
            >
              I'd like to receive updates, promotions, and news from Omenai
              (optional)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-5 mt-8">
        <button
          type="submit"
          disabled={isLoading || !canProceed}
          className="bg-dark hover:bg-dark/80 text-white border-0 ring-dark/20 duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          {isLoading ? <LoadSmall /> : "Create your artist account"}
        </button>
        <button
          disabled={isLoading}
          className="bg-white text-dark focus:ring ring-1 border-0 ring-dark/50 focus:ring-dark duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-dark cursor-pointer"
          type="button"
          onClick={decrementCurrentArtistSignupFormIndex}
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}
