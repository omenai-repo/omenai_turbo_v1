"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { galleryLoginStore } from "@omenai/shared-state-store/src/auth/login/GalleryLoginStore";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { login_url } from "@omenai/url-config/src/config";
import Link from "next/link";
import { GoArrowRight } from "react-icons/go";

export default function FormActions() {
  const { updateRecoveryModal } = actionStore();

  const { updateCurrent } = useLoginStore();

  const { isLoading } = galleryLoginStore();
  const auth_url = login_url();

  return (
    <div className="flex flex-col mt-[1rem] gap-4 w-full">
      <div className="flex flex-col gap-y-2 justify-between items-center">
        <p className="font-normal text-xs text-dark/70 text-right">
          Need a gallery account?{" "}
          <Link
            href={`${auth_url}/register/gallery`}
            className="text-dark underline"
          >
            Create one
          </Link>
        </p>

        <p className="font-normal text-xs text-dark/70 text-right">
          Forgot password?{" "}
          <span
            className="text-black cursor-pointer underline font-normal"
            onClick={() => updateRecoveryModal("gallery")}
          >
            Reset it
          </span>
        </p>
      </div>

      <div className="flex flex-col w-full gap-2 mt-[30px]">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[40px] px-4 w-full font-normal flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-black text-white text-xs"
        >
          {isLoading ? <LoadSmall /> : "Login"}{" "}
          {!isLoading && <GoArrowRight className="text-md opacity-70" />}
        </button>
        <button
          onClick={() => updateCurrent(0)}
          className="h-[40px] px-4 w-full text-center underline flex text-xs items-center justify-center bg-white cursor-pointer"
        >
          Sign in to Individual account
        </button>
      </div>
    </div>
  );
}
