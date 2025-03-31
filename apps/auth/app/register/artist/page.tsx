import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";

export default function ArtistSignup() {
  return (
    <section className="h-[100vh] w-full xl:container py-12 px-4 grid place-items-center overflow-x-hidden">
      <div className="w-full h-full lg:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative hidden lg:block">
          <ImageBlock />
        </div>

        {/* Form section */}
        <div className="w-full h-full p-2 lg:px-[50px] overflow-x-hidden">
          <FormBlock />
        </div>
      </div>
    </section>
  );
}
