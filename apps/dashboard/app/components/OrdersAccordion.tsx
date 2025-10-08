import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";

export function OrdersAccordion({
  orders,
  route,
}: {
  orders: CreateOrderModelTypes[];
  route: string;
}) {
  // See groceries data above

  const get_image_url = (url: string) => {
    const image_url = getOptimizedImage(url, "thumbnail", 40);
    return image_url;
  };

  const items = orders.map((order) => (
    <Accordion.Item key={order.order_id} value={order.order_id} className="p-5">
      <Accordion.Control>
        <div className="flex gap-x-2 items-center">
          <Image
            src={get_image_url(order.artwork_data.url)}
            alt={`${order.artwork_data.title} image`}
            width="50"
            height="50"
            className="object-fill object-center h-[50px] w-[50px] rounded"
            loading="lazy"
          />
          <div className="flex flex-col">
            <span className="text-fluid-xxs font-semibold">
              Order ID: #{order.order_id}
            </span>
            <span className="text-fluid-xxs text-gray-500">
              {order.artwork_data.title}
            </span>
          </div>
        </div>
      </Accordion.Control>
      <Accordion.Panel>
        <div className="flex flex-col gap-y-3">
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xxs font-normal">Price</span>
            <span className="text-fluid-xxs font-medium text-dark">
              {formatPrice(order.artwork_data.pricing.usd_price)}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xxs font-normal">Buyer</span>
            <span className="text-fluid-xxs font-medium text-dark">
              {order.buyer_details.name}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xxs font-normal">Status</span>
            <span className="text-fluid-xxs font-medium px-3 py-1 rounded bg-blue-300 text-dark">
              PENDING
            </span>
          </div>

          <div className="mt-5">
            <Link href={route} className="text-fluid-xxs">
              <button className="hover:bg-dark/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded h-[35px] py-2 px-4 w-fit text-center text-fluid-xxs flex items-center justify-center bg-dark cursor-pointer">
                View order
              </button>
            </Link>
          </div>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion
      variant="contained"
      radius={"md"}
      defaultValue={orders[0].order_id}
      className="w-full"
    >
      {items}
    </Accordion>
  );
}
