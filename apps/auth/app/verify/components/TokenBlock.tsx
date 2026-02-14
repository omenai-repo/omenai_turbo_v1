"use client";
import { validateStringCode } from "@omenai/shared-lib/validations/stringCodeValidator";
import { resendCode } from "@omenai/shared-services/verify/resendVerifyCode";
import { verifyEmail } from "@omenai/shared-services/verify/verifyEmail";
import { verifyAuthStore } from "@omenai/shared-state-store/src/auth/verify/VerifyAuthStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { RouteIdentifier } from "@omenai/shared-types";

type TokenProps = {
  token: string;
  route: RouteIdentifier;
};
export default function TokenBlock({ token, route }: TokenProps) {
  const [tokenValue, setTokenValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTokenLoading, setResentTokenLoading] = useState(false);

  const rollbar = useRollbar();
  const params = useSearchParams();
  const redirectTo = params.get("redirect");

  const router = useRouter();

  const [seconds, setSeconds] = useState(60);

  // Countdown logic
  useEffect(() => {
    if (seconds === 0) return; // stop countdown at 0

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Early return for validation
    const validationError = validateStringCode(tokenValue);
    if (validationError) {
      toast_notif(validationError, "error");
      return;
    }

    // Verify token
    toast.info("Verifying token");
    setIsLoading(true);

    const res = await verifyEmail({ params: token, token: tokenValue }, route);

    // Handle response
    const notifType = res.isOk ? "success" : "error";
    toast_notif(res.body.message, notifType);

    // Redirect on success
    if (res.isOk) {
      const userType = route === "individual" ? "user" : route;
      const loginUrl = redirectTo
        ? `/login/${userType}?redirect=${redirectTo}`
        : `/login/${userType}`;

      router.push(loginUrl);
    }

    setIsLoading(false);
  }

  const resendVerification = async () => {
    setResentTokenLoading(true);
    toast.info("A new token is on it's way to you");
    try {
      const payload = { author: token };
      const resent = await resendCode(route, payload);
      if (resent.isOk) {
        toast_notif(
          "A new reset token has been sent to your registered email",
          "success",
        );
      } else {
        toast_notif(
          resent.message ||
            "An error occured while performing this request, please try again or contact support",
          "error",
        );
      }
      setSeconds(30);
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong. Please try again or contact support",
        "error",
      );
    } finally {
      setResentTokenLoading(false);
    }
  };
  return (
    <div className="text-center flex flex-col items-center">
      <div className="info_text my-[1rem]">
        <h1 className="lg:text-fluid-xl md:text-fluid-lg text-fluid-sm font-bold">
          Verify your email to kickstart your journey.
        </h1>
        <div className="flex flex-col gap-4 my-[2rem]">
          <p className="leading-32 font-medium text-fluid-xxs">
            Thank you for choosing to join{" "}
            <span className="text-dark font-[900]">Omenai</span> We extend our
            warmest welcome and look forward to providing you an enjoyable
            journey with us
          </p>
          <p className="leading-32 text-fluid-xxs">
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
          className={INPUT_CLASS}
          placeholder="Verification token"
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTokenValue(e.target.value)
          }
        />
        <button
          disabled={isLoading}
          className=" disabled:bg-dark/10 p-5 rounded min-w-[100px] w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed  disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-light duration-200"
          type={"submit"}
        >
          {isLoading ? <LoadSmall /> : "Submit"}
        </button>
      </form>
      <p className="text-fluid-xxs mt-2">
        Did not receive a code?{" "}
        <button
          disabled={seconds > 0 || resendTokenLoading}
          onClick={resendVerification}
          className={`font-bold transition ${
            seconds > 0 || resendTokenLoading
              ? "text-slate-800 cursor-not-allowed"
              : "text-dark cursor-pointer hover:text-slate-800"
          }`}
        >
          {resendTokenLoading
            ? "Sending..." // replace with <LoadSmall /> if you want
            : seconds > 0
              ? `Resend code in ${seconds}s`
              : "Resend code"}
        </button>
      </p>

      <div className="contact font-medium my-[3rem] md:w-[50%] mx-auto leading-32">
        <p className="text-center text-fluid-xxs">
          Feel free to contact us should you have any issues on{" "}
          <Link
            href={"mailto:contact@omenai.net"}
            className="text-dark font-light underline"
          >
            contact@omenai.net
          </Link>
          . We are always happy to help.
        </p>
      </div>
    </div>
  );
}
