import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { NextResponse } from "next/server";
import { accountService } from "./services/account_service";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { categorizationService } from "./services/categorization_service";
import { deviceTokenService } from "./services/device_token_service";
import { notificationService } from "./services/notification_service";
import { orderService } from "./services/order_service";
import { transactionService } from "./services/transaction_service";
import { salesService } from "./services/salesService";
import { stripePaymentMethodsService } from "./services/paymentService";
import { subscriptionService } from "./services/subscriptionService";
import { walletService } from "./services/wallet_service";
import { flutterwaveService } from "./services/flutterwave_service";
import { cloudinaryService } from "./services/cloudinary_service";
import { verifyAuthVercel } from "../../utils";

type Job =
  | "anonymize_artist_account"
  | "anonymize_gallery_account"
  | "anonymize_user_account"
  | "delete_artist_categorization"
  | "delete_device_token"
  | "delete_notification_history"
  | "anonymize_order_data"
  | "anonymize_transaction"
  | "anonymize_sales_activity"
  | "detach_stripe_payment_methods"
  | "anonymize_subscription_data"
  | "upload_artwork_to_cloudinary"
  | "delete_flutterwave_beneficiary_id"
  | "anonymize_wallet_data";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    await verifyAuthVercel(request);

    await connectMongoDB();

    const jobs = (await FailedJob.find({
      jobType: {
        $in: [
          "anonymize_artist_account",
          "anonymize_gallery_account",
          "anonymize_user_account",
          "delete_artist_categorization",
          "delete_device_token",
          "delete_notification_history",
          "anonymize_order_data",
          "anonymize_transaction",
          "anonymize_sales_activity",
          "detach_stripe_payment_methods",
          "anonymize_subscription_data",
          "upload_artwork_to_cloudinary",
          "delete_flutterwave_beneficiary_id",
          "anonymize_wallet_data",
        ],
      },
      retryCount: { $lt: 3 },
    }).lean()) as unknown as FailedCronJobTypes[];
    if (jobs.length === 0)
      return NextResponse.json({ message: "No accounts to anonymize" });

    const jobTypeGroups: Record<Job, FailedCronJobTypes[]> = {
      anonymize_artist_account: [],
      anonymize_gallery_account: [],
      anonymize_user_account: [],
      delete_artist_categorization: [],
      delete_device_token: [],
      delete_notification_history: [],
      anonymize_order_data: [],
      anonymize_transaction: [],
      anonymize_sales_activity: [],
      detach_stripe_payment_methods: [],
      anonymize_subscription_data: [],
      upload_artwork_to_cloudinary: [],
      delete_flutterwave_beneficiary_id: [],
      anonymize_wallet_data: [],
    };

    // Loop through the jobs and Group them according to their job type into a single array
    jobs.forEach((job) => {
      const jobType = job.jobType as Job;
      jobTypeGroups[jobType].push(job);
    });

    // Have separate fns that handle each jobType
    // In each function, receive the accounts with their jobType as an array
    let artistIds: string[] = [];
    let galleryIds: string[] = [];
    let userIds: string[] = [];

    jobTypeGroups.anonymize_artist_account.forEach((account) => {
      artistIds.push(account.payload.artist_id);
    });
    jobTypeGroups.anonymize_gallery_account.forEach((account) => {
      galleryIds.push(account.payload.gallery_id);
    });
    jobTypeGroups.anonymize_user_account.forEach((account) => {
      userIds.push(account.payload.user_id);
    });
    await Promise.allSettled([
      accountService({ artistIds, galleryIds, userIds }),
      categorizationService(jobTypeGroups.delete_artist_categorization),
      deviceTokenService(jobTypeGroups.delete_device_token),
      notificationService(jobTypeGroups.delete_notification_history),
      orderService(jobTypeGroups.anonymize_order_data),
      transactionService(jobTypeGroups.anonymize_transaction),
      salesService(jobTypeGroups.anonymize_sales_activity),
      stripePaymentMethodsService(jobTypeGroups.detach_stripe_payment_methods),
      subscriptionService(jobTypeGroups.anonymize_subscription_data),
      walletService(jobTypeGroups.anonymize_wallet_data),
      flutterwaveService(jobTypeGroups.delete_flutterwave_beneficiary_id),
      cloudinaryService(jobTypeGroups.upload_artwork_to_cloudinary),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
