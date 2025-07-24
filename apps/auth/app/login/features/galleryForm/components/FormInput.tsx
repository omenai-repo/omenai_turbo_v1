"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { loginGallery } from "@omenai/shared-services/auth/gallery/loginGallery";
import { galleryLoginStore } from "@omenai/shared-state-store/src/auth/login/GalleryLoginStore";
import { Form } from "@omenai/shared-types";

import { auth_uri, dashboard_url } from "@omenai/url-config/src/config";

import { H } from "@highlight-run/next/client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const dashboard_base_url = dashboard_url();

  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );

  const url = useReadLocalStorage("redirect_uri_on_login") as string;

  const { setIsLoading } = galleryLoginStore();

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
      const response = await loginGallery({ ...form });

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

        if (response.isOk && data.role === "gallery") {
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
              // Your redirect logic
              if (url === "" || url === null) {
                set_redirect_uri("");
                H.identify(data.email, {
                  id: data.gallery_id as string,
                  name: data.name,
                  role: data.role,
                });
                router.refresh();
                router.replace(`${dashboard_base_url}/gallery/overview`);
              } else {
                router.replace(url);
                set_redirect_uri("");
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
            router.replace(`${auth_uri()}/verify/gallery/${data.id}`);
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
        <input
          type="Gallery email address"
          value={form.email}
          name="email"
          placeholder="Enter your Email Address"
          className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-xl text-fluid-xxs placeholder:text-fluid-xs placeholder:text-dark/40 placeholder:font-medium font-medium"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter your Password"
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
