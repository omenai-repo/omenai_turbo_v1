import { Socials } from "@omenai/shared-types";
import Link from "next/link";
import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaTiktok,
  FaBehance,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialIcons: Record<Socials, React.ReactNode> = {
  instagram: <FaInstagram className="w-4 h-4" />,
  twitter: <FaXTwitter className="w-4 h-4" />,
  linkedin: <FaLinkedin className="w-4 h-4" />,
  facebook: <FaFacebook className="w-4 h-4" />,
  tiktok: <FaTiktok className="w-4 h-4" />,
  behance: <FaBehance className="w-4 h-4" />,
};

interface Props {
  socials?: { [key in Socials]?: string };
}

export const SocialLinks: React.FC<Props> = ({ socials }) => {
  // Return null if socials object is undefined or completely empty
  if (!socials || Object.keys(socials).length === 0) return null;

  // Quick helper to capitalize the first letter of the platform (e.g., "instagram" -> "Instagram")
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {Object.entries(socials).map(([key, url]) => {
        const icon = socialIcons[key as Socials];

        if (!icon || !url) return null;

        // Ensure the URL has a protocol to prevent Next.js Link from treating it as a relative route
        const validUrl = url.startsWith("http") ? url : `https://${url}`;

        return (
          <Link
            key={key}
            href={validUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-dark hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            title={validUrl} // Shows the full URL natively when the user hovers, just in case they want to see it!
          >
            <span className="text-slate-400 transition-colors group-hover:text-slate-700">
              {icon}
            </span>
            <span>{capitalize(key)}</span>
          </Link>
        );
      })}
    </div>
  );
};
