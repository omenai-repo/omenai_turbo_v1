import Image from "next/image";

export default function HomeBG() {
  return (
    <div className="w-full h-[30vh] sm:h-[35vh]">
      <Image
        src={"/images/home_bg.jpg"}
        alt="hero-image"
        width={1000}
        height={1000}
        className="w-full h-full object-cover object-top aspect-auto rounded-[20px]"
      />
    </div>
  );
}
