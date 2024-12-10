import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Action from "../actions/Action";
import FormInput from "./components/FormInput";

export default function Form() {
  return (
    <div className="flex-1 grid place-items-center h-full font-normal p-5 relative">
      <div className="flex flex-col gap-[2rem] text-dark w-full">
        <div className="flex flex-col gap-4 text-center items-center">
          <IndividualLogo />
          <p className="text-xs">Kindly provide the following details</p>
          {/* <p className="text-base font-normal">Individual account</p> */}
        </div>
        <FormInput />
      </div>
      <Action />
    </div>
  );
}
