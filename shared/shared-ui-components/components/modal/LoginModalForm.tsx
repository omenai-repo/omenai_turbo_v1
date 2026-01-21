"use client";
import { IndividualLogo } from "../logo/Logo";
import LoginModalFormActions from "./LoginModalFormActions";

import { useState, ChangeEvent, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useRouter } from "next/navigation";
import { Form } from "@omenai/shared-types";
import { loginUser } from "@omenai/shared-services/auth/individual/loginUser";

import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { H } from "@highlight-run/next/client";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { INPUT_CLASS } from "../styles/inputClasses";
import { MdEmail, MdLock } from "react-icons/md";
import Link from "next/link";

export default function LoginModalForm() {
  const queryClient = useQueryClient();
  const { toggleLoginModal } = actionStore();
  const [loading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const router = useRouter();
  const { signOut } = useAuth({ requiredRole: "user" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginFromModal = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser({ ...form });

      if (!response.isOk) {
        toast_notif(response.message || "Login failed", "error");
      } else {
        const { data } = response;

        if (response.isOk && data.role === "user") {
          if (data.verified) {
            try {
              toast_notif("Welcome back!", "success");

              H.identify(data.email, {
                id: data.user_id as string,
                name: data.name,
                role: data.role,
              });

              await queryClient.invalidateQueries();
              router.refresh();
              toggleLoginModal(false);
            } catch (error) {
              throw error;
            }
          } else {
            await signOut();
            toast_notif(
              "Please verify your email address to continue.",
              "info",
            );
            router.replace(`${auth_uri()}/verify/individual/${data.id}`);
          }
        }
      }
    } catch (error) {
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 pb-4">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col space-y-4 items-center justify-center gap-3 mb-8">
        <div className="scale-90">
          <IndividualLogo />
        </div>
        <div className="text-center space-y-1">
          <p className="font-sans text-xs text-neutral-500">
            Enter your credentials to access your account.
          </p>
        </div>
      </div>

      {/* 2. FORM SECTION */}
      <form className="flex flex-col gap-5" onSubmit={(e) => loginFromModal(e)}>
        {/* Email Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1"
          >
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdEmail className="text-neutral-400 group-focus-within:text-dark  transition-colors" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              // Added pl-10 to make room for the icon
              className={`${INPUT_CLASS} pl-10`}
              required
              placeholder="name@example.com"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdLock className="text-neutral-400 group-focus-within:text-dark  transition-colors" />
            </div>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              placeholder="••••••••"
              className={`${INPUT_CLASS} pl-10`}
              required
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2">
          <LoginModalFormActions loading={loading} />
        </div>
      </form>
    </div>
  );
}
