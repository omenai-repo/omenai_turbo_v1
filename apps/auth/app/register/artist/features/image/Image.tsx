import Image from "next/image";

export default function ImageBlock() {
  return (
    <aside className="h-full w-full relative flex-1 hidden md:block">
      <Image
        src={"/artist__banner.png"}
        alt="Artist sign up image block"
        width={900}
        height={1440}
        className="absolute inset-0 w-full h-full object-center object-cover"
      />
    </aside>
  );
}
