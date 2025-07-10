"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { sendPasswordResetLink } from "@omenai/shared-services/password/sendPasswordResetLink";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { RouteIdentifier } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function RecoveryEmailInputField() {
  const [isLoading, setIsloading] = useState(false);
  const [email, setEmail] = useState("");
  const { recoveryModal, updateRecoveryModal } = actionStore();
  const { csrf } = useAuth();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsloading(true);

    try {
      const data = await sendPasswordResetLink(
        recoveryModal.type as RouteIdentifier,
        {
          email,
        },
        csrf || ""
      );
      if (data.isOk) {
        toast.success("Operation successful", {
          description: data.body.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        updateRecoveryModal(recoveryModal.type);
      } else
        toast.error("Error notification", {
          description: data.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
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
      setIsloading(false);
      setEmail("");
    }
  };
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <input
        type="text"
        className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 placeholder:text-fluid-xs placeholder:font-medium text-fluid-xxs font-medium"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        disabled={isLoading}
        type="submit"
        className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
      >
        {isLoading ? <LoadSmall /> : "Send reset link"}
      </button>
    </form>
  );
}
