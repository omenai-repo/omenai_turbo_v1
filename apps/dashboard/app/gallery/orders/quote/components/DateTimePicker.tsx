import { DateTimePicker } from "@mantine/dates";
import { OrderArtworkExhibitionStatus } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { Dispatch, SetStateAction } from "react";

export default function DateTimePickerComponent({
  handleDateTimeChange,
}: {
  handleDateTimeChange: Dispatch<
    SetStateAction<OrderArtworkExhibitionStatus | null>
  >;
}) {
  const now = toUTCDate(new Date());
  const maxDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  const formattedMaxDate = maxDate.toISOString().split("T")[0];

  return (
    <DateTimePicker
      size="md"
      radius="xl"
      label="Exhibition end date"
      withAsterisk
      dropdownType="modal"
      placeholder="Select the exhibition's end date and time. A shipment request will be triggered automatically on this date."
      onChange={(e) =>
        handleDateTimeChange({
          is_on_exhibition: true,
          exhibition_end_date: new Date(e).toISOString(),
          status: "pending",
        })
      }
      className="placeholder:text-fluid-xxs"
      inputSize="sm"
      timePickerProps={{
        withDropdown: true,
        popoverProps: { withinPortal: false },
        format: "12h",
      }}
      maxLevel="year"
      minDate={now}
      maxDate={formattedMaxDate}
      highlightToday
      clearable
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
          color: "#1a1a1a",
        },
        description: {
          fontSize: 13,
          color: "#1a1a1a",
          marginBottom: "8px",
          fontWeight: 400,
        },
      }}
      aria-label="Exhibition date picker"
    />
  );
}
