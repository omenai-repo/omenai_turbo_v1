import { Skeleton } from "@mantine/core";

export const ChartSkeleton = () => {
  return (
    <div className="relative w-full h-[320px] px-4 py-6 rounded-lg bg-white overflow-hidden">
      {/* Y-axis grid lines */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between">
        {[...Array(5)].map((_, idx) => (
          <Skeleton
            key={`y-line-${idx}`}
            height={1}
            className="w-full bg-gray-300 opacity-50"
          />
        ))}
      </div>

      {/* Bars */}
      <div className="absolute bottom-10 left-10 right-6 flex items-end justify-between h-[85%] px-4">
        {[...Array(12)].map((_, idx) => (
          <Skeleton
            key={`bar-${idx}`}
            width={20}
            height={`${Math.floor(Math.random() * 60) + 20}%`}
            className="bg-gray-400 rounded-md"
          />
        ))}
      </div>

      {/* X-axis labels (months) */}
      <div className="absolute bottom-2 left-10 right-6 flex justify-between px-4">
        {[...Array(12)].map((_, idx) => (
          <Skeleton
            key={`month-label-${idx}`}
            width={30}
            height={10}
            className="bg-gray-300 opacity-60"
          />
        ))}
      </div>

      {/* Y-axis values */}
      <div className="absolute top-6 left-2 h-[85%] flex flex-col justify-between">
        {[...Array(5)].map((_, idx) => (
          <Skeleton
            key={`y-label-${idx}`}
            width={30}
            height={10}
            className="bg-gray-300 opacity-60"
          />
        ))}
      </div>
    </div>
  );
};
