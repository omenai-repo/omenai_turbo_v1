import {
  differenceInDays,
  startOfYear,
  endOfYear,
  getDaysInMonth,
} from "date-fns";
import { toUTCDate } from "./toUtcDate";

export function getDaysLeft(startDate: Date, interval: "yearly" | "monthly") {
  const today = toUTCDate(new Date());
  const daysUsed = differenceInDays(today, startDate);

  const daysInMonth = getDaysInMonth(startDate);
  const daysInYear = differenceInDays(
    endOfYear(startDate),
    startOfYear(startDate)
  );

  const daysLeft =
    interval === "yearly" ? daysInYear - daysUsed : daysInMonth - daysUsed;

  return daysLeft;
}
