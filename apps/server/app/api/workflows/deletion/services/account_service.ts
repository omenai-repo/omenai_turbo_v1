import { hashEmail } from "@omenai/shared-lib/encryption/encrypt_email";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { createFailedTaskJob, validateTargetId } from "../utils";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

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
  model: any;
  idField: string;
  jobType: string;
  anonymizeFields: Record<string, any>;
  displayName: string;
}

const ACCOUNT_CONFIGS: Record<AccountType, AccountConfig> = {
  artist: {
    model: AccountArtist,
    idField: "artist_id",
    jobType: "anonymize_artist_account",
    displayName: "Artist",
    anonymizeFields: {
      name: "Deleted Artist",
      bio: "",
      art_style: [],
      categorization: "",
      password: "",
      wallet_id: "",
      algo_data_id: "",
      documentation: "",
      bio_video_link: "",
      logo: "",
      address: "",
      phone: "",
      clerkUserId: "",
    },
  },
  gallery: {
    model: AccountGallery,
    idField: "gallery_id",
    jobType: "anonymize_gallery_account",
    displayName: "Gallery",
    anonymizeFields: {
      password: "",
      connected_account_id: "",
      stripe_customer_id: "",
      phone: "",
      address: "",
      clerkUserId: "",
      name: "Deleted Gallery",
      description: null,
      logo: null,
      admin: null,
      subscription_status: { type: null, active: false },
      status: "deleted",
    },
  },
  user: {
    model: AccountIndividual,
    idField: "user_id",
    jobType: "anonymize_user_account",
    displayName: "User",
    anonymizeFields: {
      password: "",
      address: "",
      phone: "",
      name: "Deleted User",
      preferences: [],
    },
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

    // Prepare anonymized fields with hashed email
    const anonymizedFields = {
      ...config.anonymizeFields,
      email: hashEmail(account.email),
    };

    // Perform operation using updateOne
    const result = await config.model.updateOne(
      { [config.idField]: targetId },
      { $set: anonymizedFields }
    );

    // If update failed, create failed task job; otherwise return success
    if (result.matchedCount === 0) {
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
        matchedCount: result.matchedCount,
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
