import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";

export default function Action() {
  const auth_url = auth_uri();
  return (
    <div className="sm:absolute bottom-6 flex justify-between items-center w-full px-4 my-[1rem] text-center flex-col sm:flex-row md:flex-col lg:flex-row">
      <p className="font-normal text-xs">
        Got an account? Gotcha!{" "}
        <Link href={auth_url} className="text-dark font-normal underline">
          Log in
        </Link>
      </p>
      <p className="font-normal text-xs">
        Individual?{" "}
        <Link
          href={`${auth_url}/register/individual`}
          className="text-dark font-normal underline"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
