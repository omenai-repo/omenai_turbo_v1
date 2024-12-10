import FormBlock from "./features/form/FormBlock";
import ImageBlock from "./features/image/Image";

export default function GallerySignup() {
  return (
    <section className="h-[100vh] w-full">
      <div className="h-full md:flex w-full">
        {/* Image section */}
        <ImageBlock />
        {/* Form section */}
        <FormBlock />
      </div>
    </section>
  );
}
