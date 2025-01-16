import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";

export default function Action() {
  return (
    <div className=" flex justify-between items-center w-fit px-4 my-[1rem] text-center flex-col sm:flex-row md:flex-col lg:flex-row">
      <p className="font-medium text-[14px]">
        Got an account?{" "}
        <Link href={"/login"} className="text-dark font-normal underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
