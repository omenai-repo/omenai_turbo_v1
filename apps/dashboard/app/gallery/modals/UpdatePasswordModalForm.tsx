"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { requestPasswordConfirmationCode } from "@omenai/shared-services/requests/requestPasswordConfirmationCode";
import { updatePassword } from "@omenai/shared-services/requests/updatePassword";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { ChangeEvent, FormEvent, useState } from "react";
import { MdError } from "react-icons/md";
import { toast } from "sonner";

export default function UpdatePasswordModalForm() {
  const { updatePasswordModalPopup } = actionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLoading, setCodeLoading] = useState<boolean>(false);
  const [info, setInfo] = useState({
    password: "",
    confirmPassword: "",
    code: "",
  });

  const [errorList, setErrorList] = useState<string[]>([]);
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  async function requestConfirmationCode() {
    setCodeLoading(true);
    const response = await requestPasswordConfirmationCode(
      "gallery",
      user.gallery_id,
      csrf || ""
    );
    if (response?.isOk)
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
    else
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    setCodeLoading(false);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(value, name, info.password);
    if (!success) setErrorList(errors);
    else
      setInfo((prev) => {
        return { ...prev, [name]: value };
      });
  }

  async function handlePasswordUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const response = await updatePassword(
      info.password,
      info.code,
      "gallery",
      user.gallery_id,
      csrf || ""
    );

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      updatePasswordModalPopup(false);
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setLoading(false);
  }
  return (
    <div className="w-full max-h-[85vh] overflow-y-auto h-auto">
      {/* Design 1: Clean Card with Progress */}
      <div className="bg-white rounded shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Update Password
              </h1>
              <p className="text-sm text-slate-600">
                Secure your account with a new password
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-6">
          {/* Password Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  onChange={handleInputChange}
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 pr-10 bg-white border border-slate-300 rounded text-slate-900 placeholder:text-dark/30 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors placeholder:font-normal placeholder:text-fluid-xs"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-5 h-5 text-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  onChange={handleInputChange}
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 pr-10 bg-white border border-slate-300 rounded text-slate-900 placeholder:text-dark/30 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors placeholder:font-normal placeholder:text-fluid-xs"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {info.confirmPassword &&
                  info.password === info.confirmPassword ? (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-dark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Code Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Verification Code
            </label>
            <div className="flex gap-3">
              <input
                onChange={handleInputChange}
                name="code"
                type="text"
                required
                placeholder="Enter 6-digit code"
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded text-slate-900 placeholder:text-dark/30 placeholder:font-normal placeholder:text-fluid-xs focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-colors font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={requestConfirmationCode}
                disabled={
                  loading ||
                  errorList.length > 0 ||
                  info.confirmPassword === "" ||
                  info.password === "" ||
                  codeLoading
                }
                className="px-4 py-3 bg-dark text-white font-normal rounded hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-dark focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 text-fluid-xs"
              >
                {codeLoading ? <LoadSmall /> : "Send Code"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              We'll send a code to your registered email
            </p>
          </div>

          {/* Error Messages */}
          {errorList.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="space-y-2">
                {errorList.map((error, index) => (
                  <div
                    key={`${error}-${index}`}
                    className="flex items-start gap-2"
                  >
                    <MdError className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={
              loading ||
              errorList.length > 0 ||
              info.code === "" ||
              info.confirmPassword === "" ||
              info.password === ""
            }
            type="submit"
            className="w-full py-3 px-6 bg-slate-900 text-white font-normal rounded shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 text-fluid-xs"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadSmall />
                Updating Password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                Update Password
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
