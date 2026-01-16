import { Skeleton } from "@mantine/core";

export default function loading() {
  return (
    <div className="w-full flex flex-col items-center">
      <Skeleton height={50} width={800} radius="md" className="mb-3" />

      <div className="flex flex-col lg:flex-row w-full gap-10 my-10">
        <Skeleton height={500} radius="md" width={"60%"} className="mb-3" />
        <Skeleton height={500} radius="md" width={"40%"} className="mb-3" />
      </div>
    </div>
  );
}
