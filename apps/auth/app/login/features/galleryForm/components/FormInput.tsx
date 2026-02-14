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
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

// Input field configuration
const INPUT_CONFIG = {
  email: {
    type: "email",
    name: "email",
    placeholder: "Enter your email address",
  },
  password: {
    name: "password",
    placeholder: "Enter your Password",
  },
};

const showErrorToast = () => {
  toast.error("Error notification", {
    description: "Something went wrong, please try again or contact support",
    style: { background: "red", color: "white" },
    className: "class",
  });
};

export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const dashboard_base_url = dashboard_url();

  const { setIsLoading } = galleryLoginStore();
  const { signOut } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleUnverifiedGallery = async () => {
    await signOut(false);
    toast.info("Signing out...", {
      description: "You will be redirected to verify your account",
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerifiedGallery = async (data: any) => {
    try {
      toast_notif(
        "Login successful... We'll redirect you in a moment",
        "success",
      );

      router.refresh();
      router.replace(`${dashboard_base_url}/gallery/overview`);
    } catch (clerkError) {
      if (clerkError instanceof Error) {
        rollbar.error(clerkError);
      } else {
        rollbar.error(new Error(String(clerkError)));
      }
      console.error("Clerk sign-in error:", clerkError);
      throw clerkError;
    }
  };

  const processLoginResponse = async (response: any) => {
    if (!response.isOk) {
      toast_notif(response.message, "error");
      return;
    }

    const { data } = response;

    if (data.role !== "gallery") return;

    if (data.verified) {
      await handleVerifiedGallery(data);
    } else {
      await handleUnverifiedGallery();
      router.replace(`${auth_uri()}/verify/gallery/${data.id}`);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading();

    try {
      const response = await loginGallery({ ...form });
      await processLoginResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      console.error("Login error:", error);
      showErrorToast();
    } finally {
      setIsLoading();
    }
  };

  return (
    <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col w-full">
        <input
          type={INPUT_CONFIG.email.type}
          value={form.email}
          name={INPUT_CONFIG.email.name}
          placeholder={INPUT_CONFIG.email.placeholder}
          className={INPUT_CLASS}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col w-full">
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name={INPUT_CONFIG.password.name}
            placeholder={INPUT_CONFIG.password.placeholder}
            className={INPUT_CLASS}
            onChange={handleChange}
            required
          />
          <div className="w-full h-fit flex justify-end mr-5 my-5">
            <button
              type="button"
              className="text-[12px] font-semibold cursor-pointer underline duration-200"
              onClick={() => setShow(!show)}
            >
              {show ? "Hide Password" : "Show Password"}
            </button>
          </div>
        </div>
      </div>

      <FormActions />
    </form>
  );
}
