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
          <p className="font-normal text-xs">
            Forgot password?{" "}
            <span
              onClick={() => toggleLoginModalRecoveryForm(true)}
              className="text-primary cursor-pointer font-normal underline"
            >
              Let us help
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className=" disabled:cursor-not-allowed grid disabled:bg-white disabled:border disabled:border-dark place-items-center w-full h-[40px] px-4 bg-dark hover:bg-dark/70 rounded-sm text-white text-xs "
        >
          {!loading ? "Login to your account" : <LoadSmall />}
        </button>
      </div>
      <div className="w-full flex justify-center my-2">
        <p className="text-xs text-dark/80 font-normal">
          Don&apos;t have an account?{" "}
          <button onClick={() => toggleLoginModal(false)}>
            <Link
              href={`${auth_url}/register/individual`}
              className="text-dark underline font-normal"
            >
              Create one
            </Link>
          </button>
        </p>
      </div>
    </>
  );
}
