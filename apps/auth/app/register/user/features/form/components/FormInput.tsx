"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "sonner";
import FormController from "./FormController";
import { registerAccount } from "@omenai/shared-services/register/registerAccount";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { IndividualRegisterData } from "@omenai/shared-types";

export default function FormInput() {
  const {
    individualSignupData,
    preferences,
    setIsLoading,
    clearData,
    isFieldDirty,
  } = useIndividualAuthStore();

  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (allKeysEmpty(individualSignupData)) {
      toast.error("Error notification", {
        description: "All form fields must be filled out before submission.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    setIsLoading();
    const {
      name,
      email,
      password,
      country,
      countryCode,
      city,
      state,
      zip,
      address_line,
      stateCode,
      phone,
    } = individualSignupData;
    const data: Omit<IndividualRegisterData, "confirmPassword"> & {
      preferences: string[];
    } = {
      name,
      email,
      password,
      preferences,
      phone,
      address: {
        country,
        countryCode,
        city,
        state,
        zip,
        address_line,
        stateCode,
      },
    };

    const response = await registerAccount(data, "", "", "individual");

    if (response.isOk) {
      toast.success("Operation successful", {
        description: response.body.message + " redirecting...",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      if (redirectTo) {
        router.push(
          `/verify/individual/${response.body.data}?redirect=${redirectTo}`
        );
      } else {
        router.push(`/verify/individual/${response.body.data}`);
      }

      clearData();
    } else {
      toast.error("Error notification", {
        description: response.body.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setIsLoading();
  };
  return (
    <div className="">
      <form
        className="flex flex-col justify-end gap-4 w-full"
        onSubmit={handleSubmit}
      >
        <FormController />
      </form>
    </div>
  );
}
