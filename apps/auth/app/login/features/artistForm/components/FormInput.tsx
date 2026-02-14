"use client";
import { individualLoginStore } from "@omenai/shared-state-store/src/auth/login/IndividualLoginStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { Form } from "@omenai/shared-types";
import { loginArtist } from "@omenai/shared-services/auth/artist/loginArtist";
import { auth_uri, dashboard_url } from "@omenai/url-config/src/config";
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
    placeholder: "Enter your password",
  },
};

const getRedirectUrl = (data: any, dashboardBaseUrl: string) => {
  return data.isOnboardingCompleted
    ? `${dashboardBaseUrl}/artist/app/overview`
    : `${dashboardBaseUrl}/artist/onboarding`;
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

  const { setIsLoading } = individualLoginStore();
  const { signOut } = useAuth({ requiredRole: "artist" });
  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const rollbar = useRollbar();

  const handleUnverifiedUser = async () => {
    await signOut(false);
    toast.info("Signing out...", {
      description: "You will be redirected to verify your account",
    });
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerifiedArtist = async (data: any) => {
    try {
      toast_notif("Login successful", "success");

      const redirectUrl = getRedirectUrl(data, dashboard_base_url);
      router.refresh();
      router.replace(redirectUrl);
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

    if (data.role !== "artist") return;

    if (data.verified) {
      await handleVerifiedArtist(data);
    } else {
      await handleUnverifiedUser();
      router.replace(`${auth_uri()}/verify/artist/${data.id}`);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading();

    try {
      const response = await loginArtist({ ...form });
      await processLoginResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
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
          className={INPUT_CLASS}
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
            className={`relative w-full ${INPUT_CLASS}`}
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
