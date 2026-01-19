"use client";
import { Timeline, Text, ScrollArea, Paper } from "@mantine/core";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { MapPinCheckInside } from "lucide-react";
import Image from "next/image";
import { useWindowSize } from "usehooks-ts";

function formatEventDate(input: string): string {
  const date = new Date(input.replace(" ", "T")); // Ensures it's parsed correctly

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Mon
    day: "2-digit", // 28
    month: "short", // Apr
    year: "numeric", // 2025
    hour: "2-digit", // 12
    minute: "2-digit", // 16
    hour12: true, // AM/PM
  };

  return date.toLocaleString("en-US", options);
}

export default function EventTimeline({
  events,
  order_date,
  artwork_data,
  tracking_number,
}: Readonly<{
  events: any[];
  order_date: string;
  artwork_data: any;
  tracking_number: string;
}>) {
  const image_url = getOptimizedImage(artwork_data.url, "thumbnail", 20);
  const { width } = useWindowSize();
  return (
    <ScrollArea
      h={width < 768 ? 450 : 700}
      className={`w-auto min-w-[300px] max-w-[350px] p-5 h-full bg-white rounded z-[1500] `}
    >
      <div className="space-y-2 mb-8">
        {/* <h5 className="text-fluid-base font-semibold mb-5">Shipment events</h5> */}
        <Paper shadow="xs" radius="sm" withBorder p={"sm"}>
          <div className="flex gap-x-2">
            <Image
              src={image_url}
              alt={artwork_data.title}
              height={60}
              width={60}
              className="w-[60px] h-[60px] object-cover object-center rounded"
            />
            <div className="whitespace-pre-wrap">
              <p className="font-semibold text-fluid-xxs">
                {artwork_data.title}
              </p>
              <div>
                <span className="text-fluid-xxs text-muted">
                  Tracking number
                </span>
                <p className="font-bold text-fluid-xxs">#{tracking_number}</p>
              </div>
            </div>
          </div>
        </Paper>
      </div>

      {/* <Divider my={"md"} /> */}
      <Timeline color="#0f172a" active={1} lineWidth={2} bulletSize={30}>
        <Timeline.Item
          className="text-fluid-xxs"
          bullet={
            <MapPinCheckInside
              size={16}
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          }
          title="Order created"
        >
          <Text c="dimmed" size="xs">
            New Order placed. Awaiting pickup
          </Text>
          <Text size="xs" mt={4}>
            {order_date}
          </Text>
        </Timeline.Item>

        {events.map((event) => {
          return (
            <Timeline.Item
              key={event.description}
              className="text-fluid-xxs"
              bullet={
                <MapPinCheckInside
                  size={16}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              }
              title={event.description}
            >
              <div className="space-y-3">
                <Text c="dimmed" size="xs">
                  {event.serviceArea.description}
                </Text>
                <Text size="xs" mt={4}>
                  {formatEventDate(`${event.date} ${event.time}`)}
                </Text>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </ScrollArea>
  );
}
