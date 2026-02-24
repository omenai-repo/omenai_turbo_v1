"use client";

import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { resetStore } from "@omenai/shared-state-store/src/auth/reset/resetStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { resetPassword } from "@omenai/shared-services/password/resetPassword";
import { auth_uri } from "@omenai/url-config/src/config";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { RouteIdentifier } from "@omenai/shared-types";

type IdProps = {
  id: string;
  route: RouteIdentifier;
};

export default function PasswordForm({ id, route }: IdProps) {
  const { passwordData, updatePassword } = resetStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const router = useRouter();
  const auth_url = auth_uri();

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const label = e.target.name;
    const value = e.target.value;

    // Clear errors when the user starts typing again
    if (errorList.length > 0) setErrorList([]);

    updatePassword(label, value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true); // Toggle loading ON

    setErrorList([]);

    // 1. Validate Password Strength
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(passwordData.password, "password");

    if (!success) {
      setErrorList(errors);
      setIsLoading(false);
      return;
    }

    // 2. Validate Password Match
    if (passwordData.password !== passwordData.confirmPassword) {
      setErrorList(["Passwords do not match. Please try again."]);
      setIsLoading(false);
      return;
    }

    // 3. API Call
    try {
      const response = await resetPassword(route, {
        password: passwordData.password,
        id,
      });

      if (!response.isOk) {
        toast.error("Error Notification", {
          description: response.body.message || "Failed to reset password.",
          style: { background: "red", color: "white" },
        });
        setIsLoading(false);
        return;
      }

      toast.success("Password Updated", {
        description:
          response.body.message || "You can now log in with your new password.",
        style: { background: "green", color: "white" },
      });

      router.replace(`${auth_url}/login`);
    } catch (error) {
      toast.error("Network Error", {
        description:
          "Something went wrong. Please check your connection and try again.",
        style: { background: "red", color: "white" },
      });
    } finally {
      setIsLoading(false);
    }
  }

  const passwordsMatch =
    passwordData.password &&
    passwordData.confirmPassword &&
    passwordData.password === passwordData.confirmPassword;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Password Input */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="password"
          >
            New Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Enter a new password"
            onChange={handleInputChange}
            required
            minLength={8}
            className={`${INPUT_CLASS} transition-colors focus:border-indigo-500 focus:ring-indigo-500`}
          />
        </div>

        {/* Confirm Password Input */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
              onChange={handleInputChange}
              className={`${INPUT_CLASS} transition-colors ${
                passwordsMatch
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                  : "focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {/* Success Checkmark if passwords match */}
            {passwordsMatch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Validation Errors Display */}
        {errorList.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
              {errorList.map((error, index) => (
                <li key={`error-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        disabled={
          isLoading || !passwordData.password || !passwordData.confirmPassword
        }
        className="flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {isLoading ? <LoadSmall /> : "Change Password"}
      </button>
    </form>
  );
}
