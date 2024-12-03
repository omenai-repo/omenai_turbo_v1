export async function getSubscriptionHighlightData(
  subscription_status: boolean
) {
  if (subscription_status) {
    return "Active";
  } else {
    return "Inactive";
  }
}
