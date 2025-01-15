"use client";
import { IoAdd } from "react-icons/io5";

import { usePathname } from "next/navigation";
import { IoMdArrowDropright } from "react-icons/io";
import Link from "next/link";

export default function PageTitle({ title }: { title: string }) {
  const navigation = usePathname();
  const pathnames = navigation.slice(1).split("/");

  const breadcrumbs = pathnames.map((pathSegment, index, pathSegments) => {
    // Capitalize the first letter of each path segment
    const capitalizedSegment =
      pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);

    // Construct the breadcrumb link (adjust href as needed)
    const link = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // Render breadcrumb item - conditionally add separator (>)
    return (
      <span key={link} className="flex items-center gap-x-1 text-[14px]">
        {index !== 0 && index < pathSegments.length && (
          <IoMdArrowDropright className="ml-3" />
        )}
        {capitalizedSegment === "Dashboard" ||
        capitalizedSegment === "Gallery" ? (
          <span>{capitalizedSegment}</span>
        ) : (
          <a
            href={link}
            className={`${
              index === pathSegments.length - 1 && "text-green-600 font-bold"
            }`}
          >
            {capitalizedSegment}
          </a>
        )}
      </span>
    );
  });

  return (
    <div className="flex justify-between items-center w-full">
      <div className="w-full flex flex-col gap-y-1">
        <h1 className="font-normal text-md text-dark">{title}</h1>
        <p className="text-base flex">{breadcrumbs}</p>
      </div>
      {title === "My Artworks" && (
        <Link href={"/gallery/artworks/upload"} className="w-fit">
          <button className="bg-dark rounded-sm w-fit whitespace-nowrap text-white text-[14px] h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
            <span>Upload Artwork</span>
            <IoAdd className="text-sm" />
          </button>
        </Link>
      )}
    </div>
  );
}
