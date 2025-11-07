import { hashEmail } from "@omenai/shared-lib/encryption/encrypt_email";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { createFailedTaskJob, validateTargetId } from "../utils";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { storage } from "@omenai/appwrite-config";

export async function accountService(
  targetId: string,
  metadata: Record<string, any>
) {
  const checkIdvalidity = validateTargetId(targetId);
  if (!checkIdvalidity.success) return checkIdvalidity;

  return await anonymizeAccount(targetId, metadata.entityType);
}

type AccountType = "artist" | "gallery" | "user";

interface AccountConfig {
  model:
    | typeof AccountArtist
    | typeof AccountGallery
    | typeof AccountIndividual;
  idField: string;
  jobType: string;
  displayName: string;
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
      const error = `Invalid targetId: targetId does not exist in Account${config.displayName}`;
      console.error(error, { received: targetId });
      return {
        success: false,
        error,
      };
    }

    // Check if record exists in DB
    const account = await config.model.findOne({ [config.idField]: targetId });
    if (!account || !account.email) {
      const error = `Record does not exist in Account${config.displayName}`;
      console.error(error, { received: targetId });
      return {
        success: false,
        error,
      };
    }

    // delete documentation for artist
    if (accountType === "artist") {
      storage
        .deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
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
        error: `Unable to anonymize ${accountType} account`,
        failedTaskCreated: failedTask,
      };
    } else {
      console.log(`Anonymize ${config.displayName} Account successful`);
      return {
        success: true,
        deletedCount: result.deletedCount,
      };
    }
  } catch (error) {
    console.error("Failed anonymization", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
