import { RouteIdentifier } from "@omenai/shared-types";
import PasswordForm from "./PasswordForm";

type TokenProps = {
  token: string;
  route: RouteIdentifier;
};

export default function PasswordBlock({ token, route }: TokenProps) {
  return (
    <div className="flex min-h-[90dvh] w-full flex-col bg-white lg:flex-row">
      {/* LEFT SIDE: Visual & Security Info (Hidden on smaller screens) */}
      <div className="hidden w-full flex-col justify-center bg-slate-950 p-12 text-white lg:flex lg:w-1/2 xl:p-24">
        <div className="max-w-md space-y-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded -xl bg-indigo-500/20 text-indigo-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Secure your account.
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            Create a strong, unique password to keep your Omenai account and
            data safe.
          </p>
          <ul className="space-y-4 pt-4 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded -full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              Use at least 8 characters
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded -full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              Mix letters, numbers, and symbols
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded -full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              Avoid easily guessable phrases
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Update password
            </h2>
            <p className="text-sm text-slate-500">
              Please enter your new password below.
            </p>
          </div>

          <PasswordForm id={token} route={route} />
        </div>
      </div>
    </div>
  );
}
