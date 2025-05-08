"use client";

import { acceptOrderRequest } from "@omenai/shared-services/orders/acceptOrderRequest";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import {
  CreateOrderModelTypes,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
} from "@omenai/shared-types";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import DateTimePickerComponent from "./DateTimePicker";
import { Checkbox, NativeSelect, ScrollArea } from "@mantine/core";
import WarningAlert from "./WarningAlert";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
export default function QuoteForm({ order_id }: { order_id: string }) {
  const { data: order_data, isLoading } = useQuery({
    queryKey: ["get_single_order"],
    queryFn: async () => {
      const response = await getSingleOrder(order_id);
      if (!response?.isOk)
        throw new Error(
          response?.message || "Order data cannot be retrieved at this time"
        );

      return {
        data: response.data as CreateOrderModelTypes & {
          createdAt: string;
          updatedAt: string;
        },
      };
    },
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();

  const [package_details, setPackageDetails] = useState<{
    height: string;
    weight: string;
    width: string;
    length: string;
    specialInstructions?: string;
  }>({
    height: "",
    weight: "",
    width: "",
    length: "",
    specialInstructions: "",
  });
  const [terms_checked, set_terms_checked] = useState<boolean>(false);
  const [exhibition_status, set_exhibition_status] =
    useState<OrderArtworkExhibitionStatus | null>(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setPackageDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChangeExhibitionStatus(value: string) {
    if (value === "No" || value === "Select an option")
      set_exhibition_status(null);
    if (value === "Yes")
      set_exhibition_status({
        is_on_exhibition: true,
        exhibition_end_date: "",
      });
    return;
  }
  const handleSubmitQuoteFees = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { height, weight, width, length, specialInstructions } =
      package_details;
    if (
      allKeysEmpty({
        height,
        weight,
        width,
        length,
      })
    ) {
      toast.error("Error notification", {
        description:
          "All mandatory form fields must be filled out before submission.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    setLoading(true);
    if (
      Number.isNaN(height) ||
      Number.isNaN(weight) ||
      Number.isNaN(width) ||
      Number.isNaN(length)
    ) {
      toast.error("Error notification", {
        description: "Only numerical values are allowed for dimensions",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    const numerical_dimensions: ShipmentDimensions = {
      height: Number(height),
      width: Number(width),
      weight: Number(weight),
      length: Number(length),
    };

    const response = await acceptOrderRequest(
      order_data!.data.order_id,
      numerical_dimensions,
      exhibition_status,
      null,
      specialInstructions
    );
    // Accept order request call
    if (!response?.isOk) {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch_orders_by_category"],
      });
      router.replace("/gallery/orders");
    }
  };
  if (isLoading) return <Load />;
  const image_url = getImageFileView(order_data!.data.artwork_data.url, 200);

  // session.data?.user.
  return (
    <div className="mb-5 pb-5">
      <div className="w-full py-3 bg-white">
        <h1 className="text-fluid-base text-dark font-semibold">
          Artpiece Dimension (Including packaging)
        </h1>
        <span className="text-fluid-xxs font-medium">
          Kindly provide the dimensions of the piece after packaging so we can
          calculate an accurate shipping cost for it.
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 justify-center">
        <ScrollArea>
          <form
            className="w-full flex flex-col gap-y-4 p-1"
            onSubmit={handleSubmitQuoteFees}
          >
            <div className=" flex flex-col space-y-5 w-full">
              <div className="grid grid-cols-2 gap-4 items-center justify-center">
                <div className="relative w-full flex flex-col space-y-2">
                  <label
                    className="text-dark font-normal text-fluid-xxs"
                    htmlFor="shipping"
                  >
                    Length (in cm)
                  </label>
                  <input
                    onChange={handleInputChange}
                    name="length"
                    type="number"
                    step="any"
                    placeholder="Length after packaging  in centimeters"
                    className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xs font-medium p-5 rounded-full placeholder:text-dark/40 placeholder:font-medium placeholder:text-fluid-xxs"
                  />
                </div>
                <div className="relative w-full flex flex-col space-y-2">
                  <label
                    className="text-dark font-normal text-fluid-xxs"
                    htmlFor="shipping"
                  >
                    Height (in cm)
                  </label>
                  <input
                    onChange={handleInputChange}
                    name="height"
                    type="number"
                    step="any"
                    placeholder="Height after packaging in centimeters"
                    className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xs font-medium p-5 rounded-full placeholder:text-dark/40 placeholder:font-medium placeholder:text-fluid-xxs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center justify-center">
                <div className="relative w-full flex flex-col space-y-2">
                  <label
                    className="text-dark font-normal text-fluid-xxs"
                    htmlFor="shipping"
                  >
                    Width (in cm)
                  </label>
                  <input
                    onChange={handleInputChange}
                    name="width"
                    type="number"
                    step="any"
                    placeholder="Width after packaging in centimeters"
                    className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xs font-medium p-5 rounded-full placeholder:text-dark/40 placeholder:font-medium placeholder:text-fluid-xxs"
                  />
                </div>
                <div className="relative w-full flex flex-col space-y-2">
                  <label
                    className="text-dark font-normal text-fluid-xxs"
                    htmlFor="shipping"
                  >
                    Weight (in kg)
                  </label>
                  <input
                    onChange={handleInputChange}
                    name="weight"
                    type="number"
                    step="any"
                    placeholder="Weight after packaging in kilograms"
                    className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] text-fluid-xs font-medium p-5 rounded-full placeholder:text-dark/40 placeholder:font-medium placeholder:text-fluid-xxs"
                  />
                </div>
              </div>

              <div className="relative w-full flex flex-col space-y-2">
                <NativeSelect
                  size="md"
                  radius="xl"
                  label="Is this piece currently on exhibition?"
                  withAsterisk
                  data={["No", "Yes"]}
                  name="is_exhibition"
                  required
                  styles={{
                    label: {
                      fontSize: 13,
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      fontWeight: 400,
                    },
                    root: { fontSize: 13 },
                    input: {
                      border: "1px solid rgb(3 3 3 / 0.2)",
                      fontSize: 13,
                      fontWeight: 500,
                    },
                  }}
                  onChange={(e) => handleChangeExhibitionStatus(e.target.value)}
                />
              </div>
              {exhibition_status === null
                ? null
                : exhibition_status.is_on_exhibition && (
                    <div className="relative w-full flex flex-col space-y-2">
                      <DateTimePickerComponent
                        handleDateTimeChange={set_exhibition_status}
                      />
                    </div>
                  )}
            </div>

            <div className=" flex flex-col space-y-2 mt-5 w-full">
              <label
                className="text-dark font-normal text-fluid-xxs"
                htmlFor="shipping"
              >
                Special instructions (optional)
              </label>
              <div className="relative w-full flex flex-col space-y-2">
                <textarea
                  onChange={handleInputChange}
                  name="specialInstructions"
                  placeholder="any special instructions for picking up the piece (e.g., Ring the doorbell)."
                  rows={5}
                  className="p-3 border border-[#E0E0E0] text-fluid-xs font-normal placeholder:text-dark/40 placeholder:font-normal placeholder:text-fluid-xxs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none rounded-[20px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <WarningAlert />
              <Checkbox
                checked={terms_checked}
                onChange={() => set_terms_checked(!terms_checked)}
                label="I confirm that I have read and understand the terms associated with accepting this order"
                color="#1a1a1a"
                size="sm"
              />
            </div>
            <div className="w-full mt-5">
              <button
                disabled={loading || !terms_checked}
                type="submit"
                className="h-[35px] text-fluid-xxs font-normal p-5 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white"
              >
                {loading ? <LoadSmall /> : " Accept order request"}
              </button>
            </div>
          </form>
        </ScrollArea>

        {/* Details */}
        <div className="p-3 border h-fit border-[#E0E0E0] text-fluid-xxs rounded-lg">
          <div className="flex flex-col gap-y-4 text-fluid-xs">
            <div className="flex flex-col">
              <Image
                src={image_url}
                alt={order_data!.data.artwork_data.title}
                height={100}
                width={100}
                className="object-center h-[100px] w-[100px] object-cover rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-normal">Artwork name</p>
              <p className="font-semibold">
                {order_data?.data.artwork_data.title}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-normal">Artist name</p>
              <p className="font-semibold">
                {order_data?.data.artwork_data.artist}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-normal">Price</p>
              <p className="font-semibold">
                {formatPrice(order_data!.data.artwork_data.pricing.usd_price)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-normal">Buyer name</p>
              <p className="font-semibold">
                {order_data?.data.buyer_details.name}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-dark font-normal">Buyer address</p>
              <p className="font-semibold">
                {order_data?.data.shipping_details.addresses.destination.state},{" "}
                {
                  order_data?.data.shipping_details.addresses.destination
                    .country
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
