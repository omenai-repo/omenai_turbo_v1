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
export default function LoginModalForm() {
  const queryClient = useQueryClient();

  const { toggleLoginModal } = actionStore();

  const [loading, setIsLoading] = useState(false);

  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { signOut } = useAuth({ requiredRole: "user" });

  const loginFromModal = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
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
              toast_notif(
                "Login successful! Refreshing page feed...",
                "success"
              );
              // Your redirect logic
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
              "Signing out... You will be redirected to verify your account",
              "info"
            );
            router.replace(`${auth_uri()}/verify/individual/${data.id}`);
          }
        }
      }
    } catch (error) {
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginFromModal(e);
      setIsLoading(false);
    } catch (error) {}
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 my-4">
        <IndividualLogo />
        <h1 className="text-fluid-xxs text-dark font-bold mt-3 mb-5">
          Login to your user account
        </h1>
      </div>

      <form
        className="container flex flex-col gap-[1rem] my-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor={"email"} className="text-fluid-xxs">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            className={INPUT_CLASS}
            required
            placeholder="e.g john@doe.examplemail.com"
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor={"email"} className="text-fluid-xxs">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="********"
            className={INPUT_CLASS}
            required
            onChange={handleChange}
          />
        </div>
        <LoginModalFormActions loading={loading} />
      </form>
    </>
  );
}
