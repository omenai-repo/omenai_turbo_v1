"use client";
import { individualLoginStore } from "@omenai/shared-state-store/src/auth/login/IndividualLoginStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { Form } from "@omenai/shared-types";
import { loginUser } from "@omenai/shared-services/auth/individual/loginUser";

import { auth_uri, base_url } from "@omenai/url-config/src/config";
import { H } from "@highlight-run/next/client";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
export default function FormInput() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const base_uri = base_url();
  //simple state to show password visibility
  // const [hidePassword, setHidePassword] = useState(true);
  const { setIsLoading } = individualLoginStore();
  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );
  const url = useReadLocalStorage("redirect_uri_on_login") as string;
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CLIENT SIDE - Using session token approach
  // CLIENT SIDE - Using signIn.create() with token
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setIsLoading();

    try {
      const response = await loginUser({ ...form });

      if (!response.isOk) {
        toast_notif(response.message, "error");
      } else {
        const { data } = response;

        if (response.isOk && data.role === "user") {
          if (data.verified) {
            try {
              toast_notif(
                "Login successful... We'll redirect you in a moment",
                "success"
              );
              // Your redirect logic
              if (url === "" || url === null) {
                set_redirect_uri("");
                H.identify(data.email, {
                  id: data.user_id as string,
                  name: data.name,
                  role: data.role,
                });
                router.refresh();
                router.replace(base_uri);
              } else {
                router.replace(url);
                set_redirect_uri("");
              }
            } catch (error) {
              console.error("Sign-in error:", error);
              throw error;
            }
          } else {
            router.replace(`${auth_uri()}/verify/individual/${data.user_id}`);
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error notification", {
        description:
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setIsLoading();
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
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-xl text-fluid-xxs placeholder:text-fluid-xs placeholder:text-dark/40 placeholder:font-medium font-medium"
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
            className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-xl text-fluid-xxs placeholder:text-fluid-xs placeholder:text-dark/40 placeholder:font-medium font-medium"
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
      </div>
      <FormActions />
    </form>
  );
}
