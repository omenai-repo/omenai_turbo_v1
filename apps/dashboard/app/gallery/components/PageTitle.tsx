"use client";
import { IoAdd } from "react-icons/io5";

import { usePathname } from "next/navigation";
import { IoMdArrowDropright } from "react-icons/io";
import Link from "next/link";

export default function PageTitle({ title }: { title: string }) {
  const navigation = usePathname();
  const pathnames = navigation.slice(1).split("/");
  const ignoredRoutes = ["gallery", "dashboard"];
  const breadcrumbs = pathnames.map((pathSegment, index, pathSegments) => {
    // Capitalize the first letter of each path segment
    const capitalizedSegment =
      pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);

    // Construct the breadcrumb link (adjust href as needed)
    const link = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // Render breadcrumb item - conditionally add separator (>)
    return (
      <span key={link} className="flex items-center gap-x-1 text-fluid-xxs">
        {index !== 0 && index < pathSegments.length && (
          <IoMdArrowDropright className="ml-3" />
        )}
        {ignoredRoutes.includes(capitalizedSegment.toLowerCase()) ? (
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
        <p className="text-fluid-xxs flex">{breadcrumbs}</p>
      </div>
      {title === "My Artworks" && (
        <Link href={"/gallery/artworks/upload"} className="w-fit">
          <button className="h-[35px] p-4 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-light whitespace-nowrap">
            <span>Upload Artwork</span>
            <IoAdd className="text-fluid-sm" />
          </button>
        </Link>
      )}
    </div>
  );
}
