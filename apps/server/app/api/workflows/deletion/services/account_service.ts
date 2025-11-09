import { hashEmail } from "@omenai/shared-lib/encryption/encrypt_email";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import {
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { AccessRoleTypes, ArtistSchemaTypes } from "@omenai/shared-types";
import { serverStorage, storage } from "@omenai/appwrite-config";

type AccountType = Exclude<AccessRoleTypes, "admin">;

interface AccountConfig {
  model:
    | typeof AccountArtist
    | typeof AccountGallery
    | typeof AccountIndividual;
  idField: string;
  jobType: string;
  displayName: string;
}

export async function accountService(
  targetId: string,
  metadata: Record<string, any>
): Promise<DeletionReturnType> {
  const checkIdvalidity = validateTargetId(targetId);
  if (!checkIdvalidity.success) throw new Error("Invalid targetId");

  const response = await anonymizeAccount(targetId, metadata.entityType);

  return response;
}

const ACCOUNT_CONFIGS: Record<AccountType, AccountConfig> = {
  artist: {
    model: AccountArtist,
    idField: "artist_id",
    jobType: "anonymize_artist_account",
    displayName: "Artist",
  },
  gallery: {
    model: AccountGallery,
    idField: "gallery_id",
    jobType: "anonymize_gallery_account",
    displayName: "Gallery",
  },
  user: {
    model: AccountIndividual,
    idField: "user_id",
    jobType: "anonymize_user_account",
    displayName: "User",
  },
};

async function anonymizeAccount(targetId: string, accountType: AccountType) {
  try {
    const config = ACCOUNT_CONFIGS[accountType];

    // Check if value exists in DB
    const isExist = !!(await config.model.exists({
      [config.idField]: targetId,
    }));

    if (!isExist) {
      return {
        success: true,
        count: { deletedCount: 0 },

        note: "Data non-existent for deletion",
      };
    }

    // Check if record exists in DB
    const account = await config.model.findOne({ [config.idField]: targetId });

    // delete documentation for artist
    if (accountType === "artist") {
      serverStorage
        .deleteFile({
          bucketId: process.env.APPWRITE_DOCUMENTATION_BUCKET_ID!,
          fileId: account.documentation.cv,
        })
        .catch(async (err) => {
          console.error(
            `❌ Failed to delete file ${account.documentation.cv}:`,
            err.message
          );
          await createFailedTaskJob({
            error: `Unable to create job for ${accountType} Account for deleting documentation`,
            taskId: targetId,
            payload: { [config.idField]: targetId },
            jobType: "delete_artist_documentation",
          });
        });
    }

    // Perform operation using DeleteOne
    const result = await config.model.deleteOne({ [config.idField]: targetId });

    // If update failed, create failed task job; otherwise return success
    if (result.deletedCount === 0) {
      console.error(`Failed Anonymization for`, account.email);
      const failedTask = await createFailedTaskJob({
        error: `Unable to Anonymize ${accountType} Account`,
        taskId: targetId,
        payload: { [config.idField]: targetId },
        jobType: config.jobType,
      });
      return {
        success: false,
        note: "Data not deleted, Intervention in progress",
        count: { deletedCount: result.deletedCount },
        error: `Unable to anonymize ${accountType} account`,
      };
    } else {
      console.log(`Anonymize ${config.displayName} Account successful`);
      return {
        success: true,
        note: "Deletion protocol successfully completed",
        count: { deletedCount: result.deletedCount },
      };
    }
  } catch (error) {
    console.error("Failed anonymization", error);
    return {
      success: false,
      note: "An error prevented this deletion protocol from running. Manual intervention in progress",
      count: { deletedCount: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
