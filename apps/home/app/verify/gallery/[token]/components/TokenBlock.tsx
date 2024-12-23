"use client";

import { validateStringCode } from "@omenai/shared-lib/validations/stringCodeValidator";
import { resendCode } from "@omenai/shared-services/verify/resendVerifyCode";
import { verifyEmail } from "@omenai/shared-services/verify/verifyEmail";
import { verifyAuthStore } from "@omenai/shared-state-store/src/auth/verify/VerifyAuthStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
type TokenProps = {
  token: string;
};
export default function TokenBlock({ token }: TokenProps) {
  const [tokenValue, setTokenValue] = useState("");
  const { isLoading, setIsLoading } = verifyAuthStore();
  const [resendTokenLoading, setResentTokenLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const error: string = validateStringCode(tokenValue);

    if (error) {
      toast.error("Error notification", {
        description: error,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } else {
      toast.info("Verifying token");
      setIsLoading();

      const res = await verifyEmail(
        { params: token, token: tokenValue },
        "gallery"
      );
      if (!res.isOk)
        toast.error("Error notification", {
          description: res.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      if (res.isOk) {
        toast.success("Operation successful", {
          description: res.body.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        router.push("/auth/login/");
      }
      setIsLoading();
    }
  }

  const resendVerification = async () => {
    setResentTokenLoading(true);
    toast.info("A new token is on it's way to you");
    try {
      const payload = { author: token };
      await resendCode("gallery", payload);
    } catch (error) {
      toast.error("Error notification", {
        description:
          "Something went wrong. Please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setResentTokenLoading(false);
    }
  };
  return (
    <div className="text-center flex flex-col items-center">
      <div className="info_text my-[1rem]">
        <h1 className="lg:text-xl md:text-lg text-sm">
          Verify your email to kickstart your journey.
        </h1>
        <div className="flex flex-col gap-4 my-[2rem]">
          <p className="leading-32 text-xs">
            Thank you for choosing to join{" "}
            <span className="text-dark font-normal">Omenai inc.</span> We extend
            our warmest welcome and look forward to providing you with an
            enjoyable journey with us
          </p>
          <p className="leading-32 text-xs">
            A token has been sent to the email address you provided to us,
            Kindly utilize this token to authenticate your account and access
            our services.
          </p>
        </div>
      </div>

      {/* <Toaster richColors position="top-center" /> */}
      <form
        className="flex xs:flex-row flex-col gap-6 mt-8 w-full xs:justify-center mb-8"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className=" h-[40px] px-4 ring-1 ring-dark border-0 w-full md:w-1/3 placeholder:text-xs"
          placeholder="Verification token"
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTokenValue(e.target.value)
          }
        />
        <button
          disabled={isLoading}
          className=" disabled:bg-gray-400 grid place-items-center disabled:cursor-not-allowed  h-[40px] px-4 bg-black text-white transition-all ease-linear duration-200"
          type={"submit"}
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </form>
      <p className="text-xs">
        Did not recieve a code?{" "}
        <button
          disabled={resendTokenLoading}
          className="text-dark underline font-bold cursor-pointer"
          onClick={resendVerification}
        >
          {resendTokenLoading ? <LoadSmall /> : "Resend code"}
        </button>
      </p>

      <div className="contact my-[3rem] md:w-[50%] text-xs mx-auto leading-32">
        <p className="text-center">
          Feel free to contact us should you have any issues on{" "}
          <Link
            href={"mailto:contact@omenai.net"}
            className="text-dark font-normal underline"
          >
            contact@omenai.net
          </Link>
          . We are always happy to help.
        </p>
      </div>
    </div>
  );
}
