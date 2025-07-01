"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import { Form } from "@omenai/shared-types";
import { loginAdmin } from "@omenai/shared-services/auth/admin/login";

import {
  admin_url,
  auth_uri,
  dashboard_url,
} from "@omenai/url-config/src/config";
import { H } from "@highlight-run/next/client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const auth_url = auth_uri();
  const dashboard_base_url = dashboard_url();

  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );

  const url = useReadLocalStorage("redirect_uri_on_login") as string;

  const [loading, setIsLoading] = useState(false);

  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await loginAdmin({ ...form });

      if (!response.isOk) {
        toast.error("Error notification ", {
          description: response.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      } else {
        const { data } = response;

        if (response.isOk && data.role === "admin") {
          try {
            toast.success("Operation successful", {
              description: "Logged in as Admin... redirecting!",
              style: {
                background: "green",
                color: "white",
              },
              className: "class",
            });
            // Your redirect logic
            if (url === "" || url === null) {
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
          } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
          }
        }
      }
    } catch (error) {
      const error_message = (
        error as unknown as { errors: { message: string }[] }
      ).errors[0].message;

      toast.error("Error notification", {
        description:
          error_message ||
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        {/* <label htmlFor={"email"} className="text-fluid-xs text-[#858585]">
          Email address
        </label> */}
        <input
          type="email"
          value={form.email}
          name="email"
          placeholder="Enter your email address"
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xs placeholder:font-medium text-fluid-xxs font-medium"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        {/* <label htmlFor={"password"} className="text-fluid-xs text-[#858585]">
          Password
        </label> */}
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xs placeholder:font-medium text-fluid-xxs font-medium"
            onChange={handleChange}
            required
          />
          <div className="w-full h-fit flex justify-end mr-5 my-5">
            <span
              className="text-[12px] font-semibold cursor-pointer underline duration-200"
              onClick={() => setShow(!show)}
            >
              {show ? "Hide Password" : "Show Password"}
            </span>
          </div>
        </div>

        <div>
          <button
            disabled={loading}
            type="submit"
            className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            {loading ? <LoadSmall /> : "Login to your account"}{" "}
          </button>
        </div>
      </div>
    </form>
  );
}
