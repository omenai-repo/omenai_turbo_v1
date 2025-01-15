import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";

export default function Action() {
  const auth_url = auth_uri();
  return (
    <div className="sm:absolute bottom-6 flex justify-between items-center w-full px-4 my-[1rem] text-center flex-col sm:flex-row md:flex-col lg:flex-row">
      <p className="font-normal text-[14px]">
        Got an account? Gotcha!{" "}
        <Link href={auth_url} className="text-dark underline font-normal">
          Log in
        </Link>
      </p>
      <p className="font-normal text-[14px]">
        Gallery?{" "}
        <Link
          href={`${auth_url}/register/gallery`}
          className="text-dark underline text-[14px] font-normal"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
