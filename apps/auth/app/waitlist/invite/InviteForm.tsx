"use client";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import WaitlistFormLayout from "../WaitlistFormLayout";
import { auth_uri } from "@omenai/url-config/src/config";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PulseLoader } from "react-spinners";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { createInviteToken } from "@omenai/shared-services/auth/waitlist/createInviteToken";
export interface FormData {
  code: string;
  email: string;
}
export interface ValidationErrors {
  code?: string;
  email?: string;
}
export default function InviteForm({ entity }: Readonly<{ entity: string }>) {
  const auth_url = auth_uri();
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  if (!waitlistActivated) redirect(`/regiter/${entity}`);
  const [form, setForm] = useState<{ email: string; code: string }>({
    email: "",
    code: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  function validateFormFields(data: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Validate name field
    if (!data.code || data.code.trim() === "") {
      errors.code = "Code is required";
    } else if (data.code.trim().length < 2) {
      errors.code = "Code must be at least 2 characters long";
    } else if (data.code.trim().length > 100) {
      errors.code = "Code must not exceed 100 characters";
    }

    // Validate email field
    if (!data.email || data.email.trim() === "") {
      errors.email = "Email is required";
    } else {
      const email = data.email.trim();
      if (email.length > 320) {
        errors.email = "Email address is too long";
      } else {
        const atIndex = email.indexOf("@");
        const lastDotIndex = email.lastIndexOf(".");

        if (
          atIndex < 1 ||
          lastDotIndex < atIndex + 2 ||
          lastDotIndex >= email.length - 1 ||
          email.includes("@@") ||
          /\s/.test(email)
        ) {
          errors.email = "Please enter a valid email address";
        }
      }
    }

    return errors;
  }
  function isFormValid(errors: ValidationErrors): boolean {
    return Object.keys(errors).length === 0;
  }
  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: FormData = {
      code: formData.get("code") as string,
      email: formData.get("email") as string,
    };

    const errors = validateFormFields(data);

    if (isFormValid(errors)) {
      setErrors({});
      const result = await createInviteToken({
        email: data.email,
        entity,
        inviteCode: data.code,
      });
      if (result.isOk) {
        toast_notif(result.message, "success");
        redirect(
          `/register/${entity}?referrerKey=${result.referrerKey}&email=${data.email}&inviteCode=${data.code}`
        );
      } else {
        toast_notif(result.message, "error");
      }
    } else {
      setErrors(errors);
    }
    setIsSubmitting(false);
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
              <p className="text-fluid-xxs">{errors?.email}</p>
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
              <p className="text-fluid-xxs">{errors?.code}</p>
            </div>
          )}
        </div>
        <p className="font-medium text-fluid-xxs  text-right text-dark ">
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
            className=" p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
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
