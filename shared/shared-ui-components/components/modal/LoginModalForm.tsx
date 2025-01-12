"use client";
import { IndividualLogo } from "../logo/Logo";
import LoginModalFormActions from "./LoginModalFormActions";

import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useRouter } from "next/navigation";
import { Form } from "@omenai/shared-types";
import { loginUser } from "@omenai/shared-services/auth/individual/loginUser";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { login_url, base_url } from "@omenai/url-config/src/config";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

export default function LoginModalForm() {
  const queryClient = useQueryClient();

  const { toggleLoginModal } = actionStore();

  const [loading, setIsLoading] = useState(false);

  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const router = useRouter();

  const auth_url = login_url();

  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      //   router.replace(auth_url);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { mutateAsync: loginFromModal } = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const response = await loginUser({ ...form });
      return response;
    },
    onSuccess: async (data) => {
      if (data?.isOk) {
        const session = await getServerSession();
        if (session && session.role === "user") {
          if (!session.verified) {
            toast.error("Error notification", {
              description:
                "User not verified... Redirecting to verification page",
              style: {
                background: "red",
                color: "white",
              },
              className: "class",
            });
            router.replace(`${auth_url}/verify/individual/${session.user_id}`);
          } else {
            toast.success("Operation successful", {
              description: "Login successful. Refreshing page",
              style: {
                background: "green",
                color: "white",
              },
              className: "class",
            });
            await queryClient.invalidateQueries();
            router.refresh();
            toggleLoginModal(false);
          }
        }
      } else {
        toast.error("Error notification", {
          description: "Something went wrong. Please contact support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        await handleSignout();
        router.replace(`${auth_url}/login`);
      }
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginFromModal();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 my-4">
        <IndividualLogo />
        <h1 className="text-xs text-dark font-normal mt-3 mb-5">
          Login to your individual account
        </h1>
      </div>

      <form
        className="container flex flex-col gap-[1rem] my-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label htmlFor={"email"} className="text-xs">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            className="focus:ring-0 border-0 px-0 text-xs border-b-[1px] border-b-dark/30 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
            required
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={"email"} className="text-xs">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            className="focus:ring-0 border-0 px-0 border-b-[1px] text-xs border-b-dark/30 outline-none focus:outline-none focus:border-b-dark transition-all duration-200 ease-in-out ring-0 placeholder:text-dark/40 py-1"
            required
            onChange={handleChange}
          />
        </div>
        <LoginModalFormActions loading={loading} />
      </form>
    </>
  );
}
