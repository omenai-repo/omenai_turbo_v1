export type EventTemporalStatus = "Upcoming" | "Active" | "Past";

export const getEventStatus = (
  startDate: string | Date,
  endDate: string | Date,
): EventTemporalStatus => {
  const now = new Date();

  // Normalize "now" to midnight so we don't get weird mid-day status flips
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // End date should run through the very last millisecond of that day

  if (now < start) {
    return "Upcoming";
  } else if (now >= start && now <= end) {
    return "Active";
  } else {
    return "Past";
  }
};
