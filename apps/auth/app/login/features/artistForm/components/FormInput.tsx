"use client";
import { individualLoginStore } from "@omenai/shared-state-store/src/auth/login/IndividualLoginStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { PiEyeThin } from "react-icons/pi";
import { PiEyeSlashThin } from "react-icons/pi";
import { Form } from "@omenai/shared-types";
import { loginArtist } from "@omenai/shared-services/auth/artist/loginArtist";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import {
  auth_uri,
  base_url,
  dashboard_url,
} from "@omenai/url-config/src/config";

export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const auth_url = auth_uri();

  const base_uri = base_url();
  const dashboard_uri = dashboard_url();
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

  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }

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
        const session = await getServerSession();
        if (session && session.role === "artist") {
          toast.success("Operation successful", {
            description: "Login successful... redirecting!",
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          if (session.verified) {
            if (url === "" || url === null) {
              set_redirect_uri("");
              // TODO: Redirect to artist dashboard
              session.isOnboardingCompleted
                ? router.replace(base_uri)
                : router.replace(`${dashboard_uri}/artist/onboarding`);
              router.refresh();
            } else {
              router.replace(url);
              set_redirect_uri("");
            }
          } else {
            // todo: Redirect to verification page
            router.replace(`${auth_url}/verify/artist/${session.user_id}`);
          }
        } else {
          await handleSignout();
        }
      }
    } catch (error) {
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
        {/* <label htmlFor={"email"} className="text-[14px] text-[#858585]">
          Email address
        </label> */}
        <input
          type="email"
          value={form.email}
          name="email"
          placeholder="Enter your email address"
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs placeholder:font-medium text-xs font-medium"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        {/* <label htmlFor={"password"} className="text-[14px] text-[#858585]">
          Password
        </label> */}
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            className="relative w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs placeholder:font-medium text-xs font-medium"
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
