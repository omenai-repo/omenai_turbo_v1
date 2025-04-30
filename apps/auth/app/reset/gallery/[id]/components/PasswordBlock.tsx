import PasswordForm from "./PasswordForm";
type TokenProps = {
  token: string;
};
export default function PasswordBlock({ token }: TokenProps) {
  return (
    <div className="text-center flex flex-col items-center w-full mt-[8rem]">
      <div className="info_text my-[1rem]">
        <h1 className="text-fluid-base font-semibold">Update your password</h1>
      </div>
      <div className="my-[2rem] w-full sm:w-1/2 md:w-3/5 lg:w-2/5">
        <PasswordForm id={token} />
      </div>
    </div>
  );
}
