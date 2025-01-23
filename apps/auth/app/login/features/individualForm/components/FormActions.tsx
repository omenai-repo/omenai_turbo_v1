"use client";

import { individualLoginStore } from "@omenai/shared-state-store/src/auth/login/IndividualLoginStore";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import Link from "next/link";
import { GoArrowRight } from "react-icons/go";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";
export default function FormActions() {
  const { updateRecoveryModal } = actionStore();

  const { updateCurrent } = useLoginStore();

  const { isLoading } = individualLoginStore();

  const auth_url = auth_uri();

  return (
    <div className="flex flex-col mt-[1rem] gap-4 w-full">
      <div className="flex flex-col w-full gap-y-4">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
        >
          {isLoading ? <LoadSmall /> : "Login to your account"}{" "}
        </button>
        <Link href={"/register"}>
          <button className="focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center bg-white cursor-pointer">
            Create an account
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-y-2 my-6 justify-between items-center">
        <div className="flex gap-x-6">
          <p className="font-medium text-[14px] text-dark/70 ">
            <Link
              href={`${auth_url}/login/artist`}
              className="text-dark underline"
            >
              Sign in as Artist{" "}
            </Link>
          </p>
          <p className="font-medium text-[14px] text-dark/70">
            <Link
              href={`${auth_url}/login/gallery`}
              className="text-dark underline"
            >
              Sign in as Gallery{" "}
            </Link>
          </p>
        </div>

        <p
          className="text-[14px] text-dark/70 text-red-600 cursor-pointer underline font-medium"
          onClick={() => updateRecoveryModal("individual")}
        >
          Forgot password?
        </p>
      </div>
    </div>
  );
}
