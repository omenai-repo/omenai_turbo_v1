"use client";

import { sendPasswordResetLink } from "@omenai/shared-services/password/sendPasswordResetLink";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { LoadSmall } from "../loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function RecoveryModalEmailInputField() {
  const [loading, setIsloading] = useState(false);
  const [email, setEmail] = useState("");
  const { csrf } = useAuth();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsloading(true);

    try {
      const data = await sendPasswordResetLink(
        "individual",
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
        className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded w-full placeholder:text-dark/40 placeholder:text-fluid-xxs"
        placeholder="Email address"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
      >
        {!loading ? "Send reset link" : <LoadSmall />}
      </button>
    </form>
  );
}
