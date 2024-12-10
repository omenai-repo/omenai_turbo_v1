"use client";
import { sendPasswordResetLink } from "@omenai/shared-services/password/sendPasswordResetLink";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function RecoveryEmailInputField() {
  const [isLoading, setIsloading] = useState(false);
  const [email, setEmail] = useState("");
  const { recoveryModal, updateRecoveryModal } = actionStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsloading(true);

    try {
      const data = await sendPasswordResetLink(recoveryModal.type, {
        email,
      });
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
    try {
      const data = await sendPasswordResetLink(recoveryModal.type, {
        email,
      });
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
        className="p-3 border border-[#E0E0E0] text-xs placeholder:text-[#858585] placeholder:text-xs bg-white w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
        placeholder="Email address"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        disabled={isLoading}
        type="submit"
        className=" disabled:cursor-not-allowed grid disabled:bg-white disabled:border disabled:border-dark place-items-center w-full h-[40px]  bg-dark hover:bg-dark/80 hover:text-white rounded-sm text-white text-xs "
      >
        {isLoading ? <LoadSmall /> : "Send reset link"}
      </button>
    </form>
  );
}
