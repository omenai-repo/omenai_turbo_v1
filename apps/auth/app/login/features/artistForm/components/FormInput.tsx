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
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

// Input field configuration
const INPUT_CONFIG = {
  email: {
    type: "email",
    name: "email",
    placeholder: "Enter your email address",
  },
  password: {
    name: "password",
    placeholder: "Enter your password",
  },
};

const INPUT_CLASSES =
  "focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xxs placeholder:font-medium text-fluid-xxs font-medium";

// Extracted helper functions
const identifyUser = (data: any) => {
  H.identify(data.email, {
    id: data.artist_id as string,
    name: data.name,
    role: data.role,
  });
};

const getRedirectUrl = (data: any, dashboardBaseUrl: string) => {
  return data.isOnboardingCompleted
    ? `${dashboardBaseUrl}/artist/app/overview`
    : `${dashboardBaseUrl}/artist/onboarding`;
};

const handleUnverifiedUser = async (
  signOut: () => Promise<void>,
  router: any,
  userId: string
) => {
  await signOut();
  toast.info("Signing out...", {
    description: "You will be redirected to verify your account",
  });
  router.replace(`${auth_uri()}/verify/artist/${userId}`);
};

const showErrorToast = (error: any) => {
  const errorMessage = error?.errors?.[0]?.message;
  toast.error("Error notification", {
    description:
      errorMessage ||
      "Something went wrong, please try again or contact support",
    style: { background: "red", color: "white" },
    className: "class",
  });
};

export default function FormInput() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const dashboard_base_url = dashboard_url();

  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );
  const url = useReadLocalStorage("redirect_uri_on_login") as string;

  const { setIsLoading } = individualLoginStore();
  const { signOut } = useAuth({ requiredRole: "user" });
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerifiedArtist = async (data: any) => {
    try {
      toast_notif("Login successful", "success");
      identifyUser(data);

      const redirectUrl = getRedirectUrl(data, dashboard_base_url);
      router.refresh();
      router.replace(redirectUrl);
    } catch (clerkError) {
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

    if (data.role !== "artist") return;

    if (data.verified) {
      await handleVerifiedArtist(data);
    } else {
      await handleUnverifiedUser(signOut, router, data.id);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsLoading();

    try {
      const response = await loginArtist({ ...form });
      await processLoginResponse(response);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading();
    }
  };

  return (
    <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <input
          type={INPUT_CONFIG.email.type}
          value={form.email}
          name={INPUT_CONFIG.email.name}
          placeholder={INPUT_CONFIG.email.placeholder}
          className={INPUT_CLASSES}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col">
        <div className="w-full relative">
          <input
            value={form.password}
            type={show ? "text" : "password"}
            name={INPUT_CONFIG.password.name}
            placeholder={INPUT_CONFIG.password.placeholder}
            className={`relative w-full ${INPUT_CLASSES}`}
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
