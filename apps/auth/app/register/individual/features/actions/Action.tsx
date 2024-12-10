import Link from "next/link";

export default function Action() {
  return (
    <div className="sm:absolute bottom-6 flex justify-between items-center w-full px-4 my-[1rem] text-center flex-col sm:flex-row md:flex-col lg:flex-row">
      <p className="font-normal text-xs">
        Got an account? Gotcha!{" "}
        <Link href={"/auth/login/"} className="text-dark underline font-normal">
          Log in
        </Link>
      </p>
      <p className="font-normal text-xs">
        Gallery?{" "}
        <Link
          href={"/auth/register/gallery"}
          className="text-dark underline text-xs font-normal"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
