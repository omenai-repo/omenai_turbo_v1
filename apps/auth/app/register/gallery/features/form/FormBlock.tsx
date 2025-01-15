import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Action from "../actions/Action";
import FormInput from "./components/FormInput";
export default function FormBlock() {
  return (
    <div className="flex-1 grid place-items-center h-full font-normal p-5 relative">
      <div className="flex flex-col gap-[2rem] text-dark w-full">
        <div className="flex flex-col gap-4 text-center items-center">
          <GalleryLogo />

          <p className="text-[14px]">Kindly provide the following details</p>
        </div>

        <FormInput />
      </div>
      <Action />
    </div>
  );
}
