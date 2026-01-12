import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";

export function OrdersAccordion({
  orders,
  route,
}: {
  orders: CreateOrderModelTypes[];
  route: string;
}) {
  const getImageUrl = (url: string) => getOptimizedImage(url, "thumbnail", 40);

  return (
    <Accordion
      radius="lg"
      variant="separated"
      defaultValue={orders?.[0]?.order_id}
      className="w-full space-y-4"
    >
      {orders.map((order) => (
        <Accordion.Item
          key={order.order_id}
          value={order.order_id}
          className="rounded-2xl bg-white shadow-sm"
        >
          {/* HEADER */}
          <Accordion.Control className="px-5 py-4 hover:bg-neutral-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <Image
                src={getImageUrl(order.artwork_data.url)}
                alt={order.artwork_data.title}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-cover"
                loading="lazy"
              />

              <div className="flex flex-col">
                <p className="text-sm font-medium text-neutral-900">
                  {order.artwork_data.title}
                </p>
                <span className="text-xs text-neutral-500">
                  Order #{order.order_id}
                </span>
              </div>

              {/* Status */}
              <div className="ml-auto">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Pending
                </span>
              </div>
            </div>
          </Accordion.Control>

          {/* BODY */}
          <Accordion.Panel className="px-5 pb-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Price">
                {formatPrice(order.artwork_data.pricing.usd_price)}
              </InfoRow>

              <InfoRow label="Buyer">{order.buyer_details.name}</InfoRow>
            </div>

            <div className="mt-6">
              <Link
                href={route}
                className="inline-flex items-center rounded-lg bg-dark px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
              >
                View order details
              </Link>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

/* ---------- Small helper for consistent rows ---------- */

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{children}</span>
    </div>
  );
}
