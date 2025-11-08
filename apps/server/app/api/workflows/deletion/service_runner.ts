import { DeletionTaskServiceType } from "@omenai/shared-types";
import { categorizationService } from "./services/categorization_service";
import { purchaseTransactionService } from "./services/purchase_transaction_service";
import { handleUploadDeletionProtocol } from "./services/upload_service";
import { walletDeletionProtocol } from "./services/wallet_service";
import { subscriptionDeletionProtocol } from "./services/subscription_service";
import { accountService } from "./services/account_service";

// apps/server/lib/deletion-utils/deleteFromService.ts
export async function deleteFromService(
  service: DeletionTaskServiceType,
  targetId: string,
  metadata: Record<string, any>
) {
  switch (service) {
    case "order_service":
      break;
    case "wallet_service":
      return await walletDeletionProtocol(targetId);
    case "account_service":
      return await accountService(targetId, metadata);
    case "subscriptions_service":
      return await subscriptionDeletionProtocol(targetId);
    case "purchase_transaction_service":
      return await purchaseTransactionService(
        targetId,
        metadata as Record<string, any>
      );
    case "misc_service":
      break;
    case "upload_service":
      return await handleUploadDeletionProtocol(targetId);
    case "categorization_service":
      return await categorizationService(targetId);
    case "sales_service":
      break;
    default:
      throw new Error(`Unsupported service type: ${service}`);
  }
}
