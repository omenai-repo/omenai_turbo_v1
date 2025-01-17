import Image from "next/image";

export default function ImageBlock() {
  return (
    <aside className="h-full w-full relative flex-1 hidden md:block">
      <Image
        src={"/user_banner.png"}
        alt="Individual sign up image block"
        width={500}
        height={500}
        className="absolute inset-0 w-full h-full object-center object-cover rounded-tr-xl rounded-br-xl"
      />

      <div className="absolute inset-0 bg-dark opacity-50 z-10" />
    </aside>
  );
}
