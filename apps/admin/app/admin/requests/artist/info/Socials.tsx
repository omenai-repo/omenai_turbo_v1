import { Socials } from "@omenai/shared-types";
import Link from "next/link";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialIcons: Record<Socials, React.ReactNode> = {
  instagram: <FaInstagram className="w-4 h-4" />,
  twitter: <FaXTwitter className="w-4 h-4" />,
  linkedin: <FaLinkedin className="w-4 h-4" />,
};

interface Props {
  socials?: { [key in Socials]?: string };
}

export const SocialLinks: React.FC<Props> = ({ socials }) => {
  if (!socials) return null;

  return (
    <div className="flex gap-4">
      {Object.entries(socials).map(([key, url]) => {
        const icon = socialIcons[key as Socials];
        if (!icon || !url) return null;

        return (
          <Link
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark/70 hover:text-foreground text-fluid-xs transition underline leading-4 flex gap-x-1 items-center"
          >
            <span>{icon}</span>
            <span>{url}</span>
          </Link>
        );
      })}
    </div>
  );
};
