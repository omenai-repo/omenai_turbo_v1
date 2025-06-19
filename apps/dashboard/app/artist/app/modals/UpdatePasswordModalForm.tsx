"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { requestPasswordConfirmationCode } from "@omenai/shared-services/requests/requestPasswordConfirmationCode";
import { updatePassword } from "@omenai/shared-services/requests/updateGalleryPassword";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { MdError } from "react-icons/md";
import { toast } from "sonner";

export default function UpdatePasswordModalForm() {
  const { updatePasswordModalPopup } = artistActionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLoading, setCodeLoading] = useState<boolean>(false);
  const [info, setInfo] = useState({
    password: "",
    confirmPassword: "",
    code: "",
  });

  const [errorList, setErrorList] = useState<string[]>([]);
  const { user } = useAuth({ requiredRole: "artist" });

  async function requestConfirmationCode() {
    setCodeLoading(true);
    const response = await requestPasswordConfirmationCode(
      "artist",
      user.artist_id
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
      "artist",
      user.artist_id
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
    <div>
      <h1 className="text-fluid-sm font-bold mb-4 text-dark">
        Update Password Information
      </h1>
      <form onSubmit={handlePasswordUpdate} className="flex flex-col space-y-4">
        <div className="space-y-4 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label
              htmlFor="pasword"
              className="text-fluid-xxs text-[#858585] mb-2"
            >
              Password
            </label>
            <input
              onChange={handleInputChange}
              name="password"
              type="password"
              required
              placeholder="Enter a new password"
              className="w-full focus:ring ring-1 border-0 ring-[#c8c8c8] outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xxs p-6 rounded-full placeholder:text-[#606060] placeholder:text-fluid-xs"
            />
          </div>
        </div>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label
              htmlFor="confirm_password"
              className="text-fluid-xxs text-[#858585] mb-2"
            >
              Confirm password
            </label>
            <input
              onChange={handleInputChange}
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              className="w-full focus:ring ring-1 border-0 ring-[#c8c8c8] outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xxs p-6 rounded-full placeholder:text-[#606060] placeholder:text-fluid-xs"
            />
          </div>
        </div>

        <div className="space-y-2 mb-2 flex flex-col w-full relative">
          <div className="relative w-full h-auto">
            <label
              htmlFor="confirmationCode"
              className="text-fluid-xxs text-[#858585] mb-2"
            >
              Confirmation code
            </label>
            <input
              onChange={handleInputChange}
              name="code"
              type="text"
              placeholder="Enter confirmation code"
              required
              className="w-full focus:ring ring-1 border-0 ring-[#c8c8c8] outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xxs p-6 rounded-full placeholder:text-[#606060] placeholder:text-fluid-xs"
            />
          </div>

          <div className="absolute right-0 translate-y-[25%] top-[5px]">
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
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
            >
              {codeLoading ? <LoadSmall /> : "Get code"}
            </button>
          </div>
        </div>
        {errorList.length > 0 &&
          errorList.map((error, index) => {
            return (
              <div
                key={`${error}-error_list`}
                className="flex items-center gap-x-2 my-2"
              >
                <MdError className="text-red-600" />
                <p className="text-red-600 text-fluid-xxs">{error}</p>
              </div>
            );
          })}
        <div className="w-full mt-5 flex items-center gap-x-2">
          <button
            disabled={
              loading ||
              errorList.length > 0 ||
              info.code === "" ||
              info.confirmPassword === "" ||
              info.password === ""
            }
            type="submit"
            className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            {loading ? <LoadSmall /> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
