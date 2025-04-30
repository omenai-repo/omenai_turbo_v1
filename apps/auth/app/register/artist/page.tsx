import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";

export default function ArtistSignup() {
  return (
    <section className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Side Image - hidden on small screens, fixed on large screens */}
      <div className="hidden lg:block fixed top-0 left-0 w-1/2 h-screen">
        <ImageBlock />
      </div>

      {/* Form Section - full width on mobile, scrollable, and centered */}
      <div className="w-full h-screen overflow-y-auto lg:ml-[100%]">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-md">
            <FormBlock />
          </div>
        </div>
      </div>
    </section>
  );
}
