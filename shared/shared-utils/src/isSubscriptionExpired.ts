import { toUTCDate } from "./toUtcDate";

export function isSubscriptionExpired(subscriptionDateStr: string): boolean {
  const today = toUTCDate(new Date());
  today.setHours(0, 0, 0, 0); //normalize to midnight

  const subscriptionDate = toUTCDate(new Date(subscriptionDateStr));
  subscriptionDate.setHours(0, 0, 0, 0); //normalize to midnight

  return subscriptionDate < today;
}
