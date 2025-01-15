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
import { loginUser } from "@omenai/shared-services/auth/individual/loginUser";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { auth_uri, base_url } from "@omenai/url-config/src/config";

export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const auth_url = auth_uri();

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
      const response = await loginUser({ ...form });

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
        if (session && session.role === "user") {
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
              router.replace(base_uri);
              router.refresh();
            } else {
              router.replace(url);
              set_redirect_uri("");
            }
          } else {
            // todo: Redirect to verification page
            router.replace(
              `${auth_url}/verify/individual/${session.gallery_id}`
            );
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
    <form
      className="container flex flex-col gap-[1rem]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col">
        <label htmlFor={"email"} className="text-[14px] text-[#858585]">
          Email address
        </label>
        <input
          type="email"
          value={form.email}
          name="email"
          className="focus:ring-0 border-0 px-0 border-b-[1px] border-b-dark/20 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={"password"} className="text-[14px] text-[#858585]">
          Password
        </label>
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            className="focus:ring-0 border-0 w-full px-0 border-b-[1px] border-b-dark/20 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
            onChange={handleChange}
            required
          />
          <div className="absolute top-0 right-2 w-fit cursor-pointer">
            {show ? (
              <PiEyeSlashThin
                className="text-md"
                onClick={() => setShow(false)}
              />
            ) : (
              <PiEyeThin className="text-md" onClick={() => setShow(true)} />
            )}
          </div>
        </div>
      </div>
      <FormActions />
    </form>
  );
}
