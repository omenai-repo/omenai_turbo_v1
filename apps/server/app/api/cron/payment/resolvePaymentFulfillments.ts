import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, retry } from "../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PaymentLedgerTypes } from "@omenai/shared-types";
import { createWorkflow } from "@omenai/upstash-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { verifyAuthVercel } from "../utils";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    await verifyAuthVercel(request);

    await connectMongoDB();

    const unresolvedPayments = (await PaymentLedger.find({
      payment_fulfillment_checks_done: false,
      reconciliation_attempts: { $lt: 5 },
    })
      .limit(20)
      .lean()) as unknown as PaymentLedgerTypes[];

    if (unresolvedPayments.length === 0)
      return NextResponse.json({ message: "No unresolved payments to handle" });

    const shouldNotifyCount: string[] = [];
    for (const payment of unresolvedPayments) {
      const { provider, payload, provider_tx_id } = payment;
      const { meta, paymentObj } = payload;

      if (payment.reconciliation_attempts === 4)
        shouldNotifyCount.push(provider_tx_id);

      const updated = await PaymentLedger.updateOne(
        {
          provider_tx_id,
          payment_fulfillment_checks_done: false,
          reconciliation_attempts: { $lt: 5 },
        },
        {
          $inc: { reconciliation_attempts: 1 },
          $set: {
            last_reconciliation_at: toUTCDate(new Date()),
            needs_manual_review: payment.reconciliation_attempts + 1 >= 5,
          },
        },
      );

      if (updated.modifiedCount === 0) {
        continue; // someone else handled it
      }

      if (provider === "flutterwave") {
        try {
          await retry(
            () =>
              createWorkflow(
                "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
                `flw_payment_workflow_${paymentObj.id}`,
                JSON.stringify({
                  provider: "flutterwave",
                  meta,
                  verified_transaction: paymentObj,
                }),
              ),
            3,
            150,
          );
        } catch (error) {
          rollbarServerInstance.error({
            context: "Payment reconciliation cron job",
            attemptedAt: getFormattedDateTime(),
            message: "Workflow creation - Payment reconciliation cron job",
            error,
            payment_reference: paymentObj.id,
          });
        }
      }

      if (provider === "stripe") {
        try {
          await retry(
            () =>
              createWorkflow(
                "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
                `stripe_payment_workflow_${paymentObj.id}`,
                JSON.stringify({
                  provider: "stripe",
                  meta,
                  paymentIntent: paymentObj,
                }),
              ),
            3,
            150,
          );
        } catch (error) {
          rollbarServerInstance.error({
            context: "Payment reconciliation cron job",
            attemptedAt: getFormattedDateTime(),
            message: "Workflow creation - Payment reconciliation cron job",
            error,
            payment_reference: paymentObj.id,
          });
        }
      }
    }

    if (shouldNotifyCount.length > 0) {
      rollbarServerInstance.error({
        context: "Reconciliation attempts not working",
        attemptedAt: getFormattedDateTime(),
        message:
          "Payment reconciliation attempts failing - Payment reconciliation attempts cron job",
        no_of_affected_payments: shouldNotifyCount.length,
      });
      // TODO:  Send an email to dev lead
    }

    return NextResponse.json(
      {
        message: "Payment reconciliation attemped successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Critical cron job error:", error);
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Resolve payment fulfillments",
      error,
      errorResponse?.status,
    );

    return NextResponse.json(
      {
        message:
          errorResponse?.message ||
          "Critical cron job failure - Resolve payment fulfillments",
      },
      { status: errorResponse?.status || 500 },
    );
  }
});
