"use client";
import { ObjectId } from "mongoose";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import {
  CheckCheck,
  BanknoteX,
  Info,
  Truck,
  Banknote,
  icons,
  Funnel,
} from "lucide-react";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { useEffect, useRef, useState } from "react";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { base_url, tracking_url } from "@omenai/url-config/src/config";
import OrderCountdown from "./OrderCountdown";
import { renderButtonAction } from "./construct_response";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

type Orders = CreateOrderModelTypes[] & {
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
};
export default function OrdersGroup({ orders }: { orders: Orders }) {
  const pending_orders: any = [];
  const completed_orders: any = [];
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const getFilteredOrders = () => {
    if (activeFilter === "all") return orders;

    return orders.filter((order) => {
      switch (activeFilter) {
        case "fulfilled":
          return (
            order.status === "completed" &&
            order.order_accepted.status === "accepted" &&
            order.shipping_details.delivery_confirmed
          );
        case "declined":
          return order.order_accepted.status === "declined";
        case "review":
          return (
            order.status === "processing" &&
            order.order_accepted.status === "" &&
            order.payment_information.status === "pending"
          );
        case "completed":
          return (
            order.status === "processing" &&
            order.order_accepted.status === "accepted" &&
            order.payment_information.status === "completed" &&
            !order.shipping_details.shipment_information.tracking.id
          );
        case "awaiting_payment":
          return (
            order.status === "processing" &&
            order.order_accepted.status === "accepted" &&
            order.payment_information.status === "pending"
          );
        case "in_progress":
          return (
            order.status === "processing" &&
            order.order_accepted.status === "accepted" &&
            order.payment_information.status === "completed" &&
            order.shipping_details.shipment_information.tracking.id
          );
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // Loop through orders once to classify them
  orders.forEach((order: any) => {
    if (order.order_accepted.status === "") {
      pending_orders.push(order);
    } else if (
      order.order_accepted.status === "accepted" &&
      !order.shipping_details.delivery_confirmed
    ) {
      pending_orders.push(order);
    } else if (
      (order.order_accepted.status === "accepted" &&
        order.status === "completed" &&
        order.shipping_details.delivery_confirmed) ||
      order.order_accepted.status === "declined"
    ) {
      completed_orders.push(order);
    }
  });
  const get_image_url = (url: string, deletedEntity: boolean) => {
    if (deletedEntity) {
      return url;
    } else {
      const image_url = getOptimizedImage(url, "medium", 40);
      return image_url;
    }
  };

  function construct_status({
    status,
    payment_status,
    tracking_status,
    order_accepted,
    delivered,
    order_decline_reason,
  }: {
    status: string;
    payment_status: string;
    tracking_status: string | null;
    order_accepted: string;
    delivered: boolean;
    order_decline_reason?: string;
  }) {
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      !tracking_status
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs font-normal bg-amber-100 text-amber-600 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth size={16} />
          Awaiting payment
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      !tracking_status
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs font-normal bg-green-100 text-green-600 flex gap-x-1 items-center w-fit">
          <Banknote strokeWidth={1.5} absoluteStrokeWidth size={16} />
          Payment completed
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs font-normal bg-green-100 text-green-600 flex gap-x-1 items-center w-fit">
          <Truck strokeWidth={1.5} absoluteStrokeWidth size={16} />
          Delivery in progress
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "" &&
      payment_status === "pending" &&
      !tracking_status
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs font-normal bg-amber-100 text-amber-600 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth size={16} />
          Order in review
        </span>
      );
    }
    if (order_accepted === "declined") {
      return (
        <>
          <div className="flex flex-col gap-y-2">
            <span className="px-3 py-1 self-end rounded-full text-fluid-xxs font-normal text-red-600 bg-red-100 flex gap-x-1 items-center w-fit">
              <BanknoteX strokeWidth={1.5} absoluteStrokeWidth size={16} />
              Order declined
            </span>
            <span className=" rounded-full text-fluid-xxs font-normal text-red-600 hidden lg:flex items-center w-fit">
              {order_decline_reason}
            </span>
          </div>
        </>
      );
    }

    if (status === "completed" && order_accepted === "accepted" && delivered) {
      return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs font-normal bg-green-100 text-green-600 flex gap-x-1 items-center w-fit">
          <CheckCheck strokeWidth={1.5} absoluteStrokeWidth size={16} />
          Order has been fulfilled
        </span>
      );
    }
  }
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth({
    requiredRole: "user",
    redirectUrl: `${base_url()}`,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        target &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const IconComponent = icons.ChevronDown;

  const filterList = [
    {
      title: "All",
      value: "all",
      Icon: Funnel,
    },
    {
      title: "Fulfilled",
      value: "fulfilled",
      Icon: CheckCheck,
    },
    {
      title: "Completed",
      value: "completed",
      Icon: Banknote,
    },
    {
      title: "In progress",
      value: "in_progress",
      Icon: Truck,
    },
    {
      title: "In review",
      value: "review",
      Icon: Info,
    },
    {
      title: "Awaiting payment",
      value: "awaiting_payment",
      Icon: Info,
    },
    {
      title: "Declined",
      value: "declined",
      Icon: BanknoteX,
    },
  ];
  const CurrentIcon = filterList.filter(
    (filter) => filter.value === activeFilter
  )[0].Icon;
  return (
    <div className="w-full flex flex-col h-full gap-8 lg:p-5">
      <div className="flex flex-shrink-0 items-center justify-between">
        <div></div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 py-2 px-2 md:px-4 rounded-full transition-all duration-300 hover:bg-slate-400/20"
            aria-expanded={isOpen}
          >
            <CurrentIcon size={20} absoluteStrokeWidth />
            <span className=":block text-fluid-xs font-normal text-slate-800">
              {
                filterList.filter((list) => list.value === activeFilter)[0]
                  .title
              }
            </span>
            <IconComponent
              className={`h-4 w-4 text-slate-800 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 origin-top-right divide-y divide-slate-700 rounded-xl bg-dark shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
              <ul className="py-1">
                {filterList.map(({ Icon, title, value }) => {
                  return (
                    <li key={value}>
                      <button
                        onClick={() => {
                          setActiveFilter(value);
                          setIsOpen(!isOpen);
                        }}
                        className="flex items-center px-4 py-2 text-fluid-xs text-slate-200 transition-colors duration-200 hover:bg-white hover:text-slate-800 group cursor-pointer"
                      >
                        <Icon
                          strokeWidth={1.5}
                          absoluteStrokeWidth
                          size={16}
                          className="mr-3 h-5 w-5 text-slate-300 group-hover:text-slate-800"
                          aria-hidden="true"
                        />
                        {title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white flex-1 w-full overflow-y-scroll">
        <ul className="flex flex-col gap-8">
          {/* <li className="flex items-center gap-4 mx-auto rounded-3xl shadow-sm border border-slate-200 p-4 lg:p-8 w-full">
            <Image
              src={get_image_url(
                orders[0].artwork_data.url,
                orders[0].artwork_data.deletedEntity
              )}
              alt={`${orders[0].artwork_data.title} image`}
              width="500"
              height="200"
              className="object-fill flex-1 object-center h-[200px] w-[120px] rounded-[5px]"
              loading="lazy"
            />
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col ">
                  <span className="text-slate-900 font-semibold">
                    #{orders[0].order_id}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {formatISODate(orders[0].createdAt)}
                  </span>
                </div>
                {construct_status({
                  status: orders[0].status,
                  payment_status: orders[0].payment_information.status,
                  tracking_status:
                    orders[0].shipping_details.shipment_information.tracking.id,
                  order_accepted: orders[0].order_accepted.status,
                  delivered: orders[0].shipping_details.delivery_confirmed,
                  order_decline_reason: orders[0].order_accepted.reason,
                })}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-900 font-semibold">
                    {orders[0].artwork_data.title}
                  </span>
                  <span className="text-gray-600">
                    {orders[0].seller_details.name}
                  </span>
                </div>
                <span className="text-slate-900 font-semibold">
                  {formatPrice(orders[0].artwork_data.pricing.usd_price)}
                </span>
              </div>
              <div className="flex gap-x-2 max-w-[400px] items-center">
                <p className="text-amber-700 text-fluid-xxs">
                  Payment transaction is currently processing. Please check back
                  later.
                </p>
                <ClipLoader
                  size={15}
                  className="text-amber-700"
                  color="#FFA000"
                />
              </div>
            </div>
          </li> */}
          {filteredOrders.map((order) => {
            return (
              <li
                key={order.order_id}
                className="flex flex-col gap-4 mx-auto rounded-3xl shadow-sm border border-slate-200 p-4 lg:p-8 w-full"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex flex-col ">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-semibold">
                        #{order.order_id}
                      </span>
                      <div className=" lg:hidden">
                        {construct_status({
                          status: order.status,
                          payment_status: order.payment_information.status,
                          tracking_status:
                            order.shipping_details.shipment_information.tracking
                              .id,
                          order_accepted: order.order_accepted.status,
                          delivered: order.shipping_details.delivery_confirmed,
                          order_decline_reason: order.order_accepted.reason,
                        })}
                      </div>
                    </div>
                    <span className="text-gray-600 text-sm">
                      Ordered on {formatISODate(order.createdAt)}
                    </span>
                    <span className=" rounded-full text-fluid-xxs font-normal text-red-600 lg:hidden items-center w-fit">
                      {order.order_accepted.reason}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    {construct_status({
                      status: order.status,
                      payment_status: order.payment_information.status,
                      tracking_status:
                        order.shipping_details.shipment_information.tracking.id,
                      order_accepted: order.order_accepted.status,
                      delivered: order.shipping_details.delivery_confirmed,
                      order_decline_reason: order.order_accepted.reason,
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={get_image_url(
                        order.artwork_data.url,
                        order.artwork_data.deletedEntity
                      )}
                      alt={`${order.artwork_data.title} image`}
                      width="120"
                      height="120"
                      className="object-fill object-center h-[120px] w-[120px] rounded-[5px]"
                      loading="lazy"
                    />
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-semibold">
                        {order.artwork_data.title}
                      </span>
                      <span className="text-gray-600">
                        {order.seller_details.name}
                      </span>
                      <span className="text-slate-900 lg:hidden font-semibold">
                        {formatPrice(order.artwork_data.pricing.usd_price)}
                      </span>
                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === null && null}

                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === "processing" && (
                        <div className="flex gap-x-2 items-center">
                          <p className="text-amber-700 text-fluid-xxs">
                            Payment transaction is currently processing. Please
                            check back later.
                          </p>
                          <ClipLoader
                            size={15}
                            className="text-amber-700"
                            color="#FFA000"
                          />
                        </div>
                      )}
                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === "awaiting_tracking" && (
                        <div className="flex gap-x-2 items-center">
                          <p className="text-green-700 max-w-[500px] text-fluid-xxs">
                            Your shipment is being prepared. We'll notify you
                            with tracking details soon...{" "}
                            <ClipLoader
                              size={15}
                              className="text-amber-700"
                              color="#2f855a"
                            />
                          </p>
                        </div>
                      )}

                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === "awaiting_shipment_creation" && (
                        <div className="flex gap-x-2 items-center">
                          <p className="text-green-700 text-fluid-xxs">
                            This artwork is currently on exhibition. Shipment
                            will be arranged once the exhibition concludes.
                          </p>
                          <ClipLoader
                            size={15}
                            className="text-amber-700"
                            color="#2f855a"
                          />
                        </div>
                      )}

                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === "track" && (
                        <div className="mt-2 lg:mt-6">
                          <Link
                            href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                          >
                            <button className="hover:bg-dark/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded-full h-[35px] py-2 px-4 w-fit text-center text-fluid-xxs flex items-center justify-center bg-dark cursor-pointer">
                              Track this shipment
                            </button>
                          </Link>
                        </div>
                      )}
                      {renderButtonAction({
                        status: order.status,
                        payment_status: order.payment_information.status,
                        tracking_status:
                          order.shipping_details.shipment_information.tracking
                            .id,
                        order_accepted: order.order_accepted.status,
                        exhibition_active:
                          !!order.exhibition_status?.is_on_exhibition,
                      }) === "pay" && (
                        <>
                          <p className="text-red-700 text-fluid-xxs">
                            {order.payment_information.status === "failed" &&
                              "Previous payment attempt failed. Please try again"}
                          </p>
                          <div className="mt-5 flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
                            <OrderCountdown
                              expiresAt={
                                order.hold_status === null
                                  ? new Date(
                                      new Date(order.updatedAt).getTime() +
                                        24 * 60 * 60 * 1000
                                    )
                                  : order.hold_status.hold_end_date
                              }
                              order_id={order.order_id}
                              user_id={user.id}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-900 hidden lg:inline font-semibold">
                    {formatPrice(order.artwork_data.pricing.usd_price)}
                  </span>
                </div>
              </li>
            );
          })}
          {filteredOrders.length === 0 && <NotFoundData />}
        </ul>
      </div>
    </div>
  );
}
