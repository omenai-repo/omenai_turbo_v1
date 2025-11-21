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
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";

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
  "focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded text-fluid-xxs placeholder:text-fluid-xxs placeholder:text-dark/40 placeholder:font-medium font-medium";

// Helper functions
const identifyUser = (data: any) => {
  H.identify(data.email, {
    id: data.user_id as string,
    name: data.name,
    role: data.role,
  });
};

const shouldUseDefaultRedirect = (url: string | null) => {
  return url === "" || url === null;
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
  const base_uri = base_url();

  const { setIsLoading } = individualLoginStore();
  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );

  const { signOut } = useAuth({ requiredRole: "user" });
  const rollbar = useRollbar();

  const url = useReadLocalStorage("redirect_uri_on_login") as string;
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const handleUnverifiedUser = async () => {
    toast.info("Signing out...", {
      description: "You will be redirected to verify your account",
    });
    await signOut(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerifiedUser = async (data: any) => {
    try {
      toast_notif(
        "Login successful... We'll redirect you in a moment",
        "success"
      );

      if (shouldUseDefaultRedirect(url)) {
        set_redirect_uri("");
        identifyUser(data);
        router.refresh();
        router.replace(base_uri);
      } else {
        router.replace(url);
        set_redirect_uri("");
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const processLoginResponse = async (response: any) => {
    if (!response.isOk) {
      toast_notif(response.message, "error");
      return;
    }

    const { data } = response;

    if (data.role !== "user") return;

    if (data.verified) {
      await handleVerifiedUser(data);
    } else {
      await handleUnverifiedUser();
      router.replace(`${auth_uri()}/verify/individual/${data.user_id}`);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsLoading();

    try {
      const response = await loginUser({ ...form });
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
            className={`w-full ${INPUT_CLASSES}`}
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
