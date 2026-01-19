"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { galleryLoginStore } from "@omenai/shared-state-store/src/auth/login/GalleryLoginStore";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";

export default function FormActions() {
  const { updateRecoveryModal } = actionStore();

  const { updateCurrent } = useLoginStore();

  const { isLoading } = galleryLoginStore();
  const auth_url = auth_uri();

  return (
    <div className="flex flex-col mt-[1rem] gap-4 w-full">
      {/* Primary Action Group */}
      <div className="flex flex-col w-full gap-y-4">
        <button
          disabled={isLoading}
          type="submit"
          className="h-[48px] rounded w-full flex items-center justify-center gap-3 transition-all duration-300
                     disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500
                     bg-dark text-white hover:bg-slate-800 active:scale-[0.98]
                     text-[11px] uppercase tracking-[0.2em] font-medium shadow-lg shadow-dark/5"
        >
          {isLoading ? <LoadSmall /> : "Sign In to Omenai"}
        </button>

        <Link href={"/register"} className="w-full">
          <button
            className="h-[48px] border border-slate-200 hover:border-dark hover:bg-slate-50 
                             duration-300 rounded w-full text-[11px] uppercase tracking-[0.2em] 
                             font-medium text-slate-900 flex items-center justify-center"
          >
            Create an account
          </button>
        </Link>
      </div>

      {/* Alternative Entrances & Recovery */}
      <div className="flex flex-col items-center space-y-6 pt-4">
        {/* Role Switcher */}
        <div className="flex items-center gap-6">
          <Link
            href={`${auth_url}/login/artist`}
            className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-dark transition-colors font-medium"
          >
            Artist Portal
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />{" "}
          {/* Vertical Separator */}
          <Link
            href={`${auth_url}/login/user`}
            className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-dark transition-colors font-medium"
          >
            Collector Portal
          </Link>
        </div>

        {/* Password Recovery */}
        <button
          type="button"
          className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-dark 
                     transition-colors font-medium border-b border-slate-200 pb-1"
          onClick={() => updateRecoveryModal("gallery")}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
