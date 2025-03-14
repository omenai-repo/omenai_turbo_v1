"use client";

import { MdOutlineCallToAction } from "react-icons/md";
import { ObjectId } from "mongoose";
import { IoClose } from "react-icons/io5";
import { MdInfo } from "react-icons/md";
import { GoIssueClosed } from "react-icons/go";
import { ChangeEvent, useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";

type OrdersTableProps = {
  data: CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };
  tab?: "completed";
};

export default function UserOrdersTable({ data, tab }: OrdersTableProps) {
  const [orders, setOrders] = useState<
    | (CreateOrderModelTypes[] & {
        _id: ObjectId;
      })
    | []
  >(data);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.target.value.toLowerCase();

    // Update state using setState
    if (searchValue === "" || null) {
      setOrders(data);
    }
    setOrders(() => {
      const searchFilter = data.filter(
        (order) =>
          order.order_id.toLowerCase().startsWith(searchValue) ||
          order.artwork_data.title.toLowerCase().startsWith(searchValue) ||
          order.buyer_details.name.toLowerCase().startsWith(searchValue)
      );

      return [...searchFilter] as CreateOrderModelTypes[] & {
        createdAt: string;
        updatedAt: string;
        _id: ObjectId;
      };
    });
  }

  function construct_status(
    status: string,
    payment_status: string,
    tracking_status: string,
    order_accepted: string,
    delivery_confirmed: boolean
  ) {
    if (
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      tracking_status === "" &&
      !delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Awaiting payment
        </span>
      );
    }
    if (
      status === "pending" &&
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status === "" &&
      !delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Payment completed
        </span>
      );
    }
    if (
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status !== "" &&
      !delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Delivery in progress
        </span>
      );
    }
    if (
      status === "pending" &&
      order_accepted === "" &&
      payment_status === "pending" &&
      tracking_status === "" &&
      !delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Order in review
        </span>
      );
    }
    if (
      status === "completed" &&
      order_accepted === "declined" &&
      !delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-red-200 flex gap-x-1 items-center w-fit">
          <IoClose />
          Order declined by Gallery
        </span>
      );
    }
    if (
      status === "completed" &&
      order_accepted === "accepted" &&
      delivery_confirmed
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Order has been completed
        </span>
      );
    }
  }

  return (
    <div className="mt-5 overflow-hidden">
      <div className="mt-1 mb-8 w-fit h-fit relative pl-1">
        <input
          type="text"
          className="h-[40px] px-4 pl-10 w-[500px] border border-[#E0E0E0] text-[14px] placeholder:text-[#858585] placeholder:text-[14px] bg-transparent focus:border-none focus:ring-1 focus:ring-dark/80 duration-300 focus:outline-none"
          placeholder="Search by order ID, artwork name or buyer name"
          onChange={handleSearchChange}
        />
        <RiSearch2Line className="absolute left-5 top-4 text-[#858585]" />
      </div>
      <table className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll text-left md:overflow-auto">
        <thead className="w-full rounded-lg bg-[#EFEFEF] text-base font-semibold text-white">
          <tr className="px-1">
            <th className="whitespace-nowrap  py-3 pl-3 text-[14px] font-normal text-dark">
              Order ID
            </th>
            <th className="whitespace-nowrap py-3 pl-1 text-[14px] font-normal text-dark">
              Artwork name
            </th>
            <th className="whitespace-nowrap py-3 text-[14px] font-normal text-dark">
              Order Date
            </th>
            <th className="whitespace-nowrap px-2.5 py-3 text-[14px] font-normal text-dark">
              Status
            </th>
            {tab === "completed" && (
              <th className="whitespace-nowrap py-3 pl-1 text-[14px] font-normal text-dark">
                Order completion date
              </th>
            )}
            <th className="whitespace-nowrap rounded-r-lg py-3 pl-1 text-[14px] font-normal text-dark">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: CreateOrderModelTypes) => {
            return (
              <tr
                key={order.order_id}
                className="cursor-pointer bg-white ring-1 ring-[#EFEFEF] duration-200 my-2"
              >
                <td className=" py-4 pl-3 text-[14px] font-normal text-dark">
                  {order.order_id}
                </td>
                <td className="px-1 py-4 text-[14px] font-normal text-dark">
                  {order.artwork_data.title}
                </td>
                <td className="px-1 py-4 text-[14px] font-normal text-dark">
                  {formatIntlDateTime(order.createdAt)}
                </td>
                {/* <td className="px-1 py-4 text-[14px] font-normal text-dark">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </td> */}
                <td className="px-2.5 py-4 text-[14px] font-normal text-dark">
                  {construct_status(
                    order.status,
                    order.payment_information.status,
                    order.shipping_details.shipment_information.tracking.link,
                    order.order_accepted.status,
                    order.shipping_details.delivery_confirmed
                  )}
                </td>
                {order.status === "completed" && (
                  <td className="px-1 py-4 text-[14px] font-normal text-dark">
                    {formatIntlDateTime(order.updatedAt)}
                  </td>
                )}
                <td className="rounded-r-[8px] px-1 py-4 text-[14px] font-normal text-dark">
                  {order.payment_information.status === "pending" &&
                    order.status !== "completed" &&
                    order.order_accepted.status === "accepted" && (
                      <button className=" bg-dark rounded-sm text-white disabled:bg-[#E0E0E0] w-full disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
                        <span>Pay for this artwork</span>
                      </button>
                    )}
                  <div className="w-full flex items-center space-x-2">
                    {order.payment_information.status === "completed" &&
                      order.status !== "completed" &&
                      !order.shipping_details.delivery_confirmed &&
                      order.shipping_details.shipment_information.tracking
                        .link !== "" && (
                        <button className=" bg-dark disabled:bg-[#E0E0E0] rounded-sm w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
                          <span>View tracking information</span>
                        </button>
                      )}
                    {order.payment_information.status === "completed" &&
                      !order.shipping_details.delivery_confirmed &&
                      order.shipping_details.shipment_information.tracking
                        .link !== "" && (
                        <button className=" bg-green-600 disabled:bg-[#E0E0E0] rounded-sm w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
                          <span>Confirm order delivery</span>
                        </button>
                      )}
                  </div>

                  {order.payment_information.status === "completed" &&
                    order.order_accepted.status === "accepted" &&
                    order.status !== "completed" &&
                    order.shipping_details.shipment_information.tracking
                      .link === "" && (
                      <button
                        disabled
                        className=" bg-dark disabled:bg-[#E0E0E0] rounded-sm w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <span>Awaiting tracking information</span>
                      </button>
                    )}

                  {order.order_accepted.status === "" && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        disabled
                        className=" bg-dark rounded-sm disabled:cursor-not-allowed w-full disabled:bg-gray-400 disabled:text-[#A1A1A1] text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <MdOutlineCallToAction />
                        <span>Order in review</span>
                      </button>
                    </div>
                  )}
                  {order.shipping_details.delivery_confirmed && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        disabled
                        className=" bg-dark rounded-sm disabled:cursor-not-allowed w-full disabled:bg-gray-400 disabled:text-[#A1A1A1] text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <GoIssueClosed />
                        <span>This order has been fulfilled</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
