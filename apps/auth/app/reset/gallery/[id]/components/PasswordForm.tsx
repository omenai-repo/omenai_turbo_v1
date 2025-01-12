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
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="self-start font-normal" htmlFor="password">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Enter a new password"
            onChange={handleInputChange}
            required
            className="ring-1 ring-black focus:ring-primary ease-linear duration-150 transition-all px-3 py-2 rounded-sm text-xs italic placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="self-start font-normal" htmlFor="confirmpassword">
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            onChange={handleInputChange}
            className="ring-1 ring-black focus:ring-primary ease-linear duration-150 transition-all px-3 py-2 rounded-sm text-xs italic placeholder:text-gray-400"
          />

          {errorList.length > 0 &&
            errorList.map((error: string, index: Key) => {
              return (
                <p key={`${error}-error_list`} className="text-red-600 text-xs">
                  {error}
                </p>
              );
            })}
        </div>

        <div className="self-end">
          <button
            disabled={isLoading}
            className="grid disabled:cursor-not-allowed disabled:bg-dark/20 place-items-center rounded-md bg-dark h-[40px] px-4 text-white hover:bg-dark/90"
          >
            {isLoading ? <LoadSmall /> : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
