"use client";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

import { validate } from "@omenai/shared-lib/validations/validatorGroup";

import { admin_url } from "@omenai/url-config/src/config";

import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { activateAdminAccount } from "@omenai/shared-services/admin/activate_admin_account";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { CircleAlert } from "lucide-react";

interface ActivateAdminFormInputsProps {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}
export default function ActivationFormInputs() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const [errorList, set_errorList] = useState<string[]>([]);

  const token = useSearchParams().get("token");

  const [loading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ActivateAdminFormInputsProps>({
    name: "",
    confirm_password: "",
    email: "",
    password: "",
  });

  if (!token) return notFound();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "password") {
      const { success, errors }: { success: boolean; errors: string[] | [] } =
        validate(e.target.value, e.target.name);

      if (!success) {
        set_errorList(errors);
      } else set_errorList([]);
    }

    if (e.target.name === "confirm_password") {
      if (e.target.value !== form.password) {
        set_errorList(["Passwords do not match"]);
      } else set_errorList([]);
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    if (allKeysEmpty(form)) {
      toast_notif("Please fill all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await activateAdminAccount(
        token,
        form.name,
        form.email,
        form.password
      );

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      } else {
        toast_notif(response.message, "success");

        router.refresh();
        router.replace(`${admin_url()}/auth/login`);
      }
    } catch (error) {
      const error_message = (
        error as unknown as { errors: { message: string }[] }
      ).errors[0].message;

      toast_notif(
        error_message || "Something went wrong, please contact support",
        "error"
      );
      console.error("Error activating admin account:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <input
          type="text"
          value={form.name}
          name="name"
          placeholder="Enter your full name"
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-normal text-fluid-xxs font-medium"
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col">
        <input
          type="email"
          value={form.email}
          name="email"
          placeholder="Enter your email address"
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-normal text-fluid-xxs font-medium"
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col space-y-4">
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-normal text-fluid-xxs font-medium"
            onChange={handleChange}
          />
        </div>

        <div className="w-full relative">
          <input
            value={form.confirm_password}
            type={show ? "text" : "password"}
            name="confirm_password"
            disabled={form.password === ""}
            placeholder="Confirm your password"
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-normal text-fluid-xxs font-medium disabled:cursor-not-allowed disabled:bg-dark/10"
            onChange={handleChange}
          />
          <div className="w-full h-fit flex justify-end mr-5 my-5">
            <button
              className="text-[12px] font-semibold cursor-pointer underline duration-200"
              onClick={() => setShow(!show)}
            >
              {show ? "Hide Password" : "Show Password"}
            </button>
          </div>
        </div>

        {errorList.length > 0 &&
          errorList.map((error, index) => {
            return (
              <div
                key={`${index}-errorList`}
                className="flex items-center gap-x-2"
              >
                <CircleAlert className="text-red-600" />
                <p className="text-red-600 text-fluid-xxs sm:text-fluid-xxs">
                  {error}
                </p>
              </div>
            );
          })}

        <div>
          <button
            disabled={loading || errorList.length > 0}
            type="submit"
            className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            {loading ? <LoadSmall /> : "Activate your account"}{" "}
          </button>
        </div>
      </div>
    </form>
  );
}
