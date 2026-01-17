import Image from "next/image";
import Link from "next/link";
import { Button } from "@mantine/core";

type StateFlagCardProps = {
  flag_url: string;
  state: string;
  code: string;
};

export function NexusState({ flag_url, state, code }: StateFlagCardProps) {
  return (
    <div
      className="
        group relative
        rounded border border-slate-200
        bg-white
        p-4
        transition
        hover:border-slate-300 hover:shadow-sm
      "
    >
      {/* Top row */}
      <div className="flex items-center gap-4">
        {/* Flag */}
        <div className="relative h-8 w-12 overflow-hidden rounded border border-slate-200">
          <Image
            src={flag_url}
            alt={`${state} flag`}
            fill
            className="object-cover"
            sizes="48px"
            priority
          />
        </div>

        {/* State info */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{state}</span>
          <span className="text-xs font-medium text-slate-500">{code}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-slate-100" />

      {/* Action */}
      <Link href={`/admin/taxes/performance?code=${code}`}>
        <Button
          size="xs"
          variant="light"
          className="
            w-full
            justify-between
            text-slate-700
            hover:bg-slate-100
          "
        >
          <span>View performance</span>
          <span className="text-slate-400 group-hover:translate-x-0.5 transition">
            →
          </span>
        </Button>
      </Link>
    </div>
  );
}
