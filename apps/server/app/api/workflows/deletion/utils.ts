import { DeletionTaskServiceType } from "@omenai/shared-types";

// apps/server/lib/deletion-utils/deleteFromService.ts
export async function deleteFromService(
  service: DeletionTaskServiceType,
  targetId: string,
  metadata?: Record<string, any>
) {
  switch (service) {
    case "order_service":
      break;
    case "wallet_service":
      break;
    case "account_service":
      break;
    case "subscriptions_service":
      break;
    case "purchase_transaction_service":
      break;
    case "misc_service":
      break;
    case "upload_service":
      break;
    case "categorization_service":
      break;
    case "stripe_service":
      break;
    case "sales_service":
      break;
    default:
      throw new Error(`Unsupported service type: ${service}`);
  }
}
