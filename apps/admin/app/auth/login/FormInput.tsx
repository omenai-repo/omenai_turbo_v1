"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { Form } from "@omenai/shared-types";
import { loginAdmin } from "@omenai/shared-services/auth/admin/login";
import { admin_url } from "@omenai/url-config/src/config";
import { H } from "@highlight-run/next/client";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import React from "react";
import { useRollbar } from "@rollbar/react";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const rollbar = useRollbar();

  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    "",
  );

  const url = useReadLocalStorage("redirect_uri_on_login") as string;
  const [loading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginAdmin({ ...form });

      if (!response.isOk) {
        toast_notif(response.message, "error");
      } else {
        const { data } = response;

        if (data.role === "admin") {
          toast_notif(response.message, "success");

          if (!url) {
            set_redirect_uri("");
            H.identify(data.email, {
              id: data.id as string,
              name: data.name,
              role: data.role,
            });
            router.refresh();
            router.replace(`${admin_url()}/admin/requests/gallery`);
          } else {
            router.replace(url);
            set_redirect_uri("");
          }
        }
      }
    } catch (error: any) {
      rollbar.error(error instanceof Error ? error : new Error(String(error)));

      // Safely access the error message without crashing if .errors is undefined
      const error_message =
        error?.errors?.[0]?.message ||
        error?.message ||
        "Something went wrong, please try again.";

      toast.error("Login Failed", {
        description: error_message,
        style: {
          background: "#EF4444", // Modern Tailwind red-500
          color: "white",
          border: "none",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-1.5">
        <input
          type="email"
          value={form.email}
          name="email"
          placeholder="Email address"
          className={INPUT_CLASS}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            placeholder="Password"
            className={`${INPUT_CLASS} pr-16`} // Added padding right to prevent text overlap with the button
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          disabled={loading}
          type="submit"
          className="h-[44px] rounded-lg w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-black hover:bg-gray-900 transition-colors text-white text-sm font-medium"
        >
          {loading ? <LoadSmall /> : "Sign in"}
        </button>
      </div>
    </form>
  );
}
