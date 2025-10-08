"use client";

import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { resetPassword } from "@omenai/shared-services/password/resetPassword";
import { resetStore } from "@omenai/shared-state-store/src/auth/reset/resetStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, Key, useState } from "react";
import { toast } from "sonner";

type IdProps = {
  id: string;
};
export default function PasswordForm({ id }: IdProps) {
  const { isLoading, setIsLoading, passwordData, updatePassword } =
    resetStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const router = useRouter();

  const auth_url = auth_uri();

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const label = e.target.name;
    const value = e.target.value;

    updatePassword(label, value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading();

    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(passwordData.password, "password");

    if (!success) {
      setErrorList(errors);
      setIsLoading();
    } else {
      if (passwordData.password !== passwordData.confirmPassword) {
        toast.error("Error notification", {
          description: "Passwords do not match",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setIsLoading();
      } else {
        const response = await resetPassword("gallery", {
          password: passwordData.password,
          id,
        });

        if (!response.isOk)
          toast.error("Error notification", {
            description: response.body.message,
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
        else {
          toast.success("Operation successful", {
            description: response.body.message,
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          router.replace(`${auth_url}/login`);
        }
        setIsLoading();
      }
    }
  }
  return (
    <div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="text-[#858585] text-fluid-xxs font-normal self-start"
            htmlFor="password"
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Enter a new password"
            onChange={handleInputChange}
            required
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-medium text-fluid-xxs font-medium"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-[#858585] text-fluid-xxs font-normal self-start"
            htmlFor="confirmpassword"
          >
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            onChange={handleInputChange}
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-medium text-fluid-xxs font-medium"
          />

          {errorList.length > 0 &&
            errorList.map((error, index) => {
              return (
                <p
                  key={`${error}-error_list`}
                  className="text-red-600 text-fluid-xxs"
                >
                  {error}
                </p>
              );
            })}
        </div>

        <div className="w-full">
          <button
            disabled={isLoading}
            className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            {isLoading ? <LoadSmall /> : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
