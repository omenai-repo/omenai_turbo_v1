import { MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mantine/core"; // Adjust based on your setup

type StateFlagCardProps = {
  flag_url: string;
  state: string;
  code: string;
};

export function NexusState({ flag_url, state, code }: StateFlagCardProps) {
  return (
    <div className="group relative overflow-hidden rounded border border-gray-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700 dark:hover:shadow-gray-900/50">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-900/10 dark:to-purple-900/10" />

      {/* Decorative corner accent */}
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-75" />

      <div className="relative flex flex-col p-4 space-y-3">
        <div className="flex items-center gap-5">
          {/* Enhanced flag container */}
          <div className="relative">
            <div className="absolute inset-0 rounded bg-gradient-to-br from-gray-200 to-gray-300 opacity-20 blur-xl transition-all duration-300 group-hover:opacity-40 dark:from-gray-600 dark:to-gray-700" />
            <div className="relative overflow-hidden rounded shadow-md  transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg dark:ring-gray-700/50">
              <Image
                src={flag_url}
                alt={`${state} state flag`}
                height={40}
                width={50}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
            </div>
          </div>

          {/* State information */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <h2 className="text-fluid-xxs font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-white">
                {state}
              </h2>
            </div>
            <p className="text-fluid-xxs font-medium text-slate-700 dark:text-gray-400">
              {code}
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          href={`/admin/taxes/performance?code=${code}`}
          className="group/button"
        >
          <Button
            variant="default"
            size="xs"
            className="relative overflow-hidden border bg-dark bg-white/80 text-white backdrop-blur-sm transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              View performance
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
          </Button>
        </Link>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-gray-600" />
    </div>
  );
}
