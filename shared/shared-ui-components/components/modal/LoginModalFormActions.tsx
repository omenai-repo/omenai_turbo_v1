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
      <div className="flex w-full flex-col mt-[1rem] space-y-8">
        <div className="flex justify-end w-full my-3">
          <p className="font-normal text-fluid-xxs">
            Forgot password?{" "}
            <button
              type="button"
              onClick={() => toggleLoginModalRecoveryForm(true)}
              className="text-dark cursor-pointer font-bold underline"
            >
              Let us help
            </button>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
        >
          {!loading ? "Login to your account" : <LoadSmall />}
        </button>
      </div>
      <div className="w-full flex justify-center my-4">
        <p className="text-fluid-xxs text-dark font-medium">
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
