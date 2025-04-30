import { Skeleton } from "@mantine/core";

export default function PayoutSkeleton() {
  return (
    <div>
      <div className="rounded-2xl border p-6 flex w-[500px] h-[250px] flex-col items-center justify-center gap-2">
        <Skeleton height={16} width="50%" />
        <Skeleton height={32} width={80} />
        <Skeleton height={16} width="75%" />
        <div className="mt-6 w-full">
          <Skeleton height={48} width={"100%"} radius="xl" />
        </div>
      </div>

      {/* Earnings Table */}
      <div className="col-span-1 xl:col-span-3 overflow-auto mt-10">
        <div className="w-full min-w-[800px]">
          <div className="grid grid-cols-6 gap-4 p-4 border-b">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={16} width={96} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} height={16} width={96} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
