import { DeletionTaskServiceType } from "@omenai/shared-types";
import { categorizationService } from "./services/categorization_service";
import { purchaseTransactionService } from "./services/purchase_transaction_service";
import { handleUploadDeletionProtocol } from "./services/upload_service";
import { walletDeletionProtocol } from "./services/wallet_service";
import { subscriptionDeletionProtocol } from "./services/subscription_service";
import { accountService } from "./services/account_service";
import { orderDeletionServiceProtocol } from "./services/order_service";
import { salesServiceDeletionProtocol } from "./services/sales_service";
import { miscServiceDeletionProtocol } from "./services/misc_service";
import { DeletionReturnType } from "./utils";
import { defaultServiceProtocol } from "./services/default_service";

// apps/server/lib/deletion-utils/deleteFromService.ts
export async function deleteFromService(
  service: DeletionTaskServiceType,
  targetId: string,
  metadata: Record<string, any>
): Promise<DeletionReturnType> {
  switch (service) {
    case "order_service":
      return await orderDeletionServiceProtocol(targetId, metadata.entityType);
    case "wallet_service":
      return await walletDeletionProtocol(targetId);
    case "account_service":
      return await accountService(targetId, metadata);
    case "subscriptions_service":
      return await subscriptionDeletionProtocol(targetId);
    case "purchase_transaction_service":
      return await purchaseTransactionService(
        targetId,
        metadata
      );
    case "misc_service":
      return await miscServiceDeletionProtocol(targetId);
    case "upload_service":
      return await handleUploadDeletionProtocol(targetId);
    case "categorization_service":
      return await categorizationService(targetId);
    case "sales_service":
      return await salesServiceDeletionProtocol(targetId);
    default:
      return await defaultServiceProtocol();
  }
}
