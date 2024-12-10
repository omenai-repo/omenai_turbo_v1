"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "sonner";
import FormController from "./FormController";
import { registerAccount } from "@omenai/shared-services/register/registerAccount";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";

export default function FormInput() {
  const { individualSignupData, preferences, setIsLoading, clearData } =
    useIndividualAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading();
    const { name, email, password } = individualSignupData;
    const data = {
      name,
      email,
      password,
      preferences,
    };

    const response = await registerAccount(data, "individual");

    if (response.isOk) {
      toast.success("Operation successful", {
        description: response.body.message + " redirecting...",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      router.push(`/verify/individual/${response.body.data}`);
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
        className="flex flex-col justify-end gap-4 w-full container lg:px-[2rem] xl:px-[4rem] 2xl:px-[7rem]"
        onSubmit={handleSubmit}
      >
        <FormController />
      </form>
    </div>
  );
}
