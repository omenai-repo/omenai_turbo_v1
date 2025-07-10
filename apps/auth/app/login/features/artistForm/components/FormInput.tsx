"use client";
import { individualLoginStore } from "@omenai/shared-state-store/src/auth/login/IndividualLoginStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import { Form } from "@omenai/shared-types";
import { loginArtist } from "@omenai/shared-services/auth/artist/loginArtist";

import { auth_uri, dashboard_url } from "@omenai/url-config/src/config";
import { H } from "@highlight-run/next/client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

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

  const { setIsLoading } = individualLoginStore();

  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { signOut } = useAuth({ requiredRole: "user" });

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setIsLoading();

    try {
      const response = await loginArtist({ ...form });

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

        if (response.isOk && data.role === "artist") {
          if (data.verified) {
            try {
              toast.success("Operation successful", {
                description: "Login successful... redirecting!",
                style: {
                  background: "green",
                  color: "white",
                },
                className: "class",
              });
              H.identify(data.email, {
                id: data.artist_id as string,
                name: data.name,
                role: data.role,
              });
              // Your redirect logic
              if (data.isOnboardingCompleted) {
                router.refresh();
                router.replace(`${dashboard_base_url}/artist/app/overview`);
              } else {
                router.refresh();
                router.replace(`${dashboard_base_url}/artist/onboarding`);
              }
            } catch (clerkError) {
              console.error("Clerk sign-in error:", clerkError);
              throw clerkError;
            }
          } else {
            await signOut();
            toast.info("Signing out...", {
              description: "You will be redirected to verify your account",
            });
            router.replace(`${auth_uri()}/verify/artist/${data.id}`);
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
      </div>
      <FormActions />
    </form>
  );
}
