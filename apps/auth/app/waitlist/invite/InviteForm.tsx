"use client";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import Link from "next/link";
import React from "react";
import WaitlistFormLayout from "../WaitlistFormLayout";
import { auth_uri } from "@omenai/url-config/src/config";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PulseLoader } from "react-spinners";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { createInviteToken } from "@omenai/shared-services/auth/waitlist/createInviteToken";
import { useWaitlistForm } from "../useWaitlistForm";
import {
  validateInviteForm,
  isFormValid,
  InviteFormData,
} from "../FormValidation";

export default function InviteForm({ entity }: Readonly<{ entity: string }>) {
  const auth_url = auth_uri();
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  const router = useRouter();

  if (!waitlistActivated) router.replace(`/regiter/${entity}`);

  const { errors, setErrors, isSubmitting, setIsSubmitting, handleChange } =
    useWaitlistForm<{ email: string; code: string }>({
      email: "",
      code: "",
    });

  // Extract form data
  function getFormData(form: HTMLFormElement): InviteFormData {
    const formData = new FormData(form);
    return {
      code: formData.get("code") as string,
      email: formData.get("email") as string,
    };
  }

  // Handle validation
  function validateForm(data: InviteFormData, setErrors: Function): boolean {
    const validationErrors = validateInviteForm(data);

    if (isFormValid(validationErrors)) {
      setErrors({});
      return true;
    }

    setErrors(validationErrors);
    return false;
  }

  // Handle API call and navigation
  async function processInvite(
    data: InviteFormData,
    entity: string,
    router: any
  ): Promise<void> {
    const result = await createInviteToken({
      email: data.email,
      entity,
      inviteCode: data.code,
    });

    if (result.isOk) {
      toast_notif(result.message, "success");
      const params = new URLSearchParams({
        referrerKey: result.referrerKey,
        email: data.email,
        inviteCode: data.code,
      });
      router.replace(`/register/${entity}?${params}`);
    } else {
      toast_notif(result.message, "error");
    }
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = getFormData(e.currentTarget);

      if (validateForm(data, setErrors)) {
        await processInvite(data, entity, router);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <WaitlistFormLayout
      title="Be the First to Experience Omenai"
      description="Already have an invite code? Enter it here to get instant access."
    >
      <form onSubmit={submitHandler} className="flex flex-col gap-y-5">
        <div className="flex flex-col">
          <input
            type={"email"}
            placeholder={
              entity === "gallery"
                ? "Enter the gallery email address"
                : "Enter your email address"
            }
            className={INPUT_CLASS}
            name="email"
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors?.email && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="text-fluid-xxs">{errors.email}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <input
            type={"text"}
            placeholder={
              entity === "gallery"
                ? "Enter the gallery invite code"
                : "Enter your invite code"
            }
            className={INPUT_CLASS}
            name="code"
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors?.code && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="text-fluid-xxs">{errors.code}</p>
            </div>
          )}
        </div>
        <p className="font-medium text-fluid-xxs text-right text-dark">
          <Link
            href={`${auth_url}/waitlist?entity=${entity}`}
            className="text-dark hover:underline"
          >
            I don't have an invite code
          </Link>
        </p>

        <div className="flex flex-col w-full gap-y-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
          >
            {isSubmitting ? (
              <PulseLoader size={5} color="#ffffff" />
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </form>
    </WaitlistFormLayout>
  );
}
