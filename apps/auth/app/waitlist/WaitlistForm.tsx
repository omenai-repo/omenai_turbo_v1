"use client";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";
import React from "react";
import WaitlistFormLayout from "./WaitlistFormLayout";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { joinWaitlist } from "@omenai/shared-services/auth/waitlist/joinWaitlist";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { PulseLoader } from "react-spinners";
import { useWaitlistForm } from "./useWaitlistForm";
import {
  validateWaitlistForm,
  isFormValid,
  WaitlistFormData,
} from "./FormValidation";

export default function WaitlistForm({ entity }: Readonly<{ entity: string }>) {
  const auth_url = auth_uri();
  const router = useRouter();
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );

  if (!waitlistActivated) router.replace(`/regiter/${entity}`);

  const { errors, setErrors, isSubmitting, setIsSubmitting, handleChange } =
    useWaitlistForm<{ email: string; name: string }>({
      email: "",
      name: "",
    });

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: WaitlistFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    const validationErrors = validateWaitlistForm(data);

    if (isFormValid(validationErrors)) {
      setErrors({});
      const result = await joinWaitlist({ ...data, entity });
      if (result.isOk) {
        toast_notif(result.message, "success");
        router.replace("/waitlist/success");
      } else {
        toast_notif(result.message, "error");
      }
    } else {
      setErrors(validationErrors);
    }
    setIsSubmitting(false);
  }

  return (
    <WaitlistFormLayout
      title="Join our exclusive waitlist"
      description="We're building something special, and we want you to be part of it from day one."
    >
      <form onSubmit={submitHandler} className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-2">
          <input
            type={"text"}
            placeholder={
              entity === "gallery"
                ? "Enter the gallery name"
                : "Enter your name"
            }
            className={INPUT_CLASS}
            name="name"
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors?.name && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="text-fluid-xxs">{errors.name}</p>
            </div>
          )}
        </div>
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
        <p className="font-medium text-fluid-xxs text-right text-dark">
          <Link
            href={`${auth_url}/waitlist/invite?entity=${entity}`}
            className="text-dark hover:underline"
          >
            I have an invite code
          </Link>
        </p>

        <div className="flex flex-col w-full gap-y-4">
          <button
            type="submit"
            className="p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
          >
            {isSubmitting ? (
              <PulseLoader size={5} color="#ffffff" />
            ) : (
              "Join the waitlist"
            )}
          </button>
        </div>
      </form>
    </WaitlistFormLayout>
  );
}
