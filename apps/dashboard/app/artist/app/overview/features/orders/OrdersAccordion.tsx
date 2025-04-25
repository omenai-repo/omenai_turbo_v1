import { Accordion } from "@mantine/core";
import { groceries } from "./mocks";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";

export function OrdersAccordion({
  orders,
}: {
  orders: CreateOrderModelTypes & { createdAt: string; updatedAt: string };
}) {
  // See groceries data above
  const items = groceries.map((item) => (
    <Accordion.Item key={item.value} value={item.value}>
      <Accordion.Control>
        <div className="flex gap-x-2 items-center">
          <Image src="" alt="" width="50" height="50" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Hello world</span>
            <span className="text-xs text-gray-500">{item.description}</span>
          </div>
        </div>
      </Accordion.Control>
      <Accordion.Panel>{item.description}</Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion
      variant="separated"
      radius="xl"
      defaultValue="Apples"
      className="w-full"
    >
      {items}
    </Accordion>
  );
}
