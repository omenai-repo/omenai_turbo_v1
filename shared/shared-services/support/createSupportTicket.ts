import { EntityType, SupportCategory } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

type Payload = {
  category: SupportCategory;
  referenceId: string;
  message: string;
  pageUrl: string;
  timestamp: string;
  entity: Exclude<EntityType, "admin">;
  userId: string;
  userEmail: string;
  meta: any;
  transactionDate?: string | null;
};

export async function createSupportTicket(payload: Payload, token: string) {
  try {
    const response = await fetch(`${getApiUrl()}/api/support`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json", "x-csrf-token": token },

      credentials: "include",
    });
    const result = await response.json();

    return {
      isOk: response.ok,
      message: result.message,
      ticketId: result.ticketId,
    };
  } catch (error) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
