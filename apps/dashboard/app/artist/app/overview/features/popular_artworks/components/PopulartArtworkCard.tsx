// components/dashboard/overview/PopularArtworkCard.tsx
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";

type Props = {
  url: string;
  title: string;
  artist: string;
  impressions: number;
  rank: 1 | 2 | 3;
};

const rankStyles = {
  1: {
    badge: "bg-amber-100 text-amber-800",
    ring: "ring-2 ring-amber-400/40",
    image: "h-14 w-14",
    title: "text-base",
  },
  2: {
    badge: "bg-slate-100 text-slate-700",
    ring: "ring-1 ring-slate-300/40",
    image: "h-12 w-12",
    title: "text-sm",
  },
  3: {
    badge: "bg-slate-50 text-slate-600",
    ring: "ring-1 ring-slate-200/40",
    image: "h-12 w-12",
    title: "text-sm",
  },
};

function PopularArtworkCard({ url, title, artist, impressions, rank }: Props) {
  const image_url = getOptimizedImage(url, "thumbnail", 40);
  const styles = rankStyles[rank];

  return (
    <div className="flex items-center justify-between rounded bg-white p-4 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded text-xs font-semibold ${styles.badge}`}
        >
          {rank}
        </div>

        {/* Artwork */}
        <div className={`rounded ring-offset-2 ${styles.ring}`}>
          <Image
            src={image_url}
            alt={title}
            height={56}
            width={56}
            className={`rounded object-cover ${styles.image}`}
          />
        </div>

        {/* Meta */}
        <div className="flex flex-col">
          <p className={`font-semibold text-slate-900 ${styles.title}`}>
            {title}
          </p>
          <span className="text-xs text-slate-500">{artist}</span>
        </div>
      </div>

      {/* Right */}
      <div className="text-right flex items-center space-x-1">
        <p className="text-sm font-medium text-slate-900">
          {impressions.toLocaleString()}
        </p>
        <span className="text-xs text-slate-500">likes</span>
      </div>
    </div>
  );
}

export default function PopularArtworksRanking({
  artworks,
}: {
  artworks: Omit<Props, "rank">[];
}) {
  const topThree = [...artworks]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {topThree.map((artwork, index) => (
        <PopularArtworkCard
          key={artwork.title}
          rank={(index + 1) as 1 | 2 | 3}
          {...artwork}
        />
      ))}
    </div>
  );
}
