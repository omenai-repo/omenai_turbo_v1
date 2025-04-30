"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import { LoadSmall } from "../loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";

export default function LoginModalFormActions({
  loading,
}: {
  loading: boolean;
}) {
  const { toggleLoginModal, toggleLoginModalRecoveryForm } = actionStore();
  const auth_url = auth_uri();

  return (
    <>
      <div className="flex w-full flex-col mt-[1rem] gap-4">
        <div className="flex justify-end w-full my-3">
          <p className="font-normal text-[14px]">
            Forgot password?{" "}
            <span
              onClick={() => toggleLoginModalRecoveryForm(true)}
              className="text-gray-700 cursor-pointer font-bold underline"
            >
              Let us help
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
        >
          {!loading ? "Login to your account" : <LoadSmall />}
        </button>
      </div>
      <div className="w-full flex justify-center my-2">
        <p className="text-[14px] text-gray-700/80 font-medium">
          Don&apos;t have an account?{" "}
          <button onClick={() => toggleLoginModal(false)}>
            <Link
              href={`${auth_url}/register/user`}
              className="text-dark font-bold"
            >
              Create one
            </Link>
          </button>
        </p>
      </div>
    </>
  );
}
