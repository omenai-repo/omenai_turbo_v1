import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { NextResponse } from "next/server";

type Job =
  | "anonymize_artist_account"
  | "anonymize_gallery_account"
  | "anonymize_user_account";

export const GET = withRateLimit(standardRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    const accountsToAnonymize = await FailedJob.find({
      jobType: {
        $matches: [
          "anonymize_artist_account",
          "anonymize_gallery_account",
          "anonymize_user_account",
        ],
      },
    }).lean();

    const jobTypeGroups: Record<Job, any> = {
      anonymize_artist_account: [],
      anonymize_gallery_account: [],
      anonymize_user_account: [],
    };

    if (accountsToAnonymize.length === 0)
      return NextResponse.json({ message: "No accounts to anonymize" });

    // Loop through the accounts to anonymize
    // Group them according to their job type into a single array
    // Have separate fns that handle each jobType
    // In each function, receive the accounts with their jobType as an array
    // Create and run the fn to anonymize the job type
    // Once done, bulkwrite to delete from DB

    const jonRuns = await Promise.allSettled([
      handleAnonymizeArtistAccount(jobTypeGroups.anonymize_artist_account),
      handleAnonymizeGalleryAccount(jobTypeGroups.anonymize_gallery_account),
      handleAnonymizeUserAccount(jobTypeGroups.anonymize_user_account),
    ]);

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({});
  }
});

async function handleAnonymizeArtistAccount(accounts: any[]) {
  // Write the fn to anonymize
  if (accounts.length === 0) return;
}
async function handleAnonymizeGalleryAccount(accounts: any[]) {
  // Write the fn to anonymize
}
async function handleAnonymizeUserAccount(accounts: any[]) {
  // Write the fn to anonymize
}
