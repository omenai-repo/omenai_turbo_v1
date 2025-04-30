"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { requestPasswordConfirmationCode } from "@omenai/shared-services/requests/requestPasswordConfirmationCode";
import { updatePassword } from "@omenai/shared-services/requests/updateGalleryPassword";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
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
  const { session } = useContext(SessionContext);

  async function requestConfirmationCode() {
    setCodeLoading(true);
    const response = await requestPasswordConfirmationCode(
      "gallery",
      (session as GallerySchemaTypes).gallery_id
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
      (session as GallerySchemaTypes).gallery_id
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
      <form onSubmit={handlePasswordUpdate}>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label
              htmlFor="shipping"
              className="text-fluid-xs text-[#858585] mb-2"
            >
              Password
            </label>
            <input
              onChange={handleInputChange}
              name="password"
              type="password"
              required
              placeholder="Enter a new password"
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xxs"
            />
          </div>
        </div>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label
              htmlFor="shipping"
              className="text-fluid-xs text-[#858585] mb-2"
            >
              Confirm password
            </label>
            <input
              onChange={handleInputChange}
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xxs"
            />
          </div>
        </div>

        <div className="space-y-2 mb-2 flex flex-col w-full relative">
          <div className="relative w-full h-auto">
            <label
              htmlFor="shipping"
              className="text-fluid-xs text-[#858585] mb-2"
            >
              Confirmation code
            </label>
            <input
              onChange={handleInputChange}
              name="code"
              type="text"
              placeholder="Enter confirmation code"
              required
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xxs"
            />
          </div>

          <div className="absolute right-0 translate-y-[25%] top-[4px]">
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
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
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
                <p className="text-red-600 text-fluid-xs">{error}</p>
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
            className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
          >
            {loading ? <LoadSmall /> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
