import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";
import { NexusTransactionHistoryModel } from "@omenai/shared-models/models/transactions/NexusTransactionHistorySchema";
import { isBefore, subMonths } from "date-fns";
import { connectMongoDB } from "../mongo_connect/mongoConnect";
import { NexusDocument } from "@omenai/shared-types";
import { ObjectId } from "mongoose";
// import { sendAdminEmail, sendBulkVendorEmails } from "../services/emailService";

const THRESHOLD_TYPES = {
  SALES_ONLY: "SALES_ONLY",
  SALES_OR_TRANSACTIONS: "SALES_OR_TRANSACTIONS",
  SALES_AND_TRANSACTIONS: "SALES_AND_TRANSACTIONS",
};

// Function to calculate Nexus exposure
export const updateNexusTracking = async (
  stateCode: string,
  sales: number,
  transactions: number
): Promise<void | { status: boolean; state: string; stateCode: string }> => {
  await connectMongoDB();
  const nexus = await NexusTransactions.findOne({ stateCode });

  if (!nexus) throw new Error("Nexus rule not found for state");

  // Update sales and transactions
  nexus.calculation.total_sales += sales;
  nexus.calculation.total_transactions += 1;

  // Calculate exposure percentage
  const { sales_threshold, transactions_threshold, threshold_type } =
    nexus.nexus_rule;

  const calculatePercentage = (value: number, threshold: number): number =>
    threshold > 0 ? (value / threshold) * 100 : 0;

  nexus.calculation.sales_exposure_percentage = calculatePercentage(
    nexus.calculation.total_sales,
    sales_threshold
  );

  nexus.calculation.transactions_exposure_percentage = calculatePercentage(
    nexus.calculation.total_transactions,
    transactions_threshold || 0
  );

  let is_breached = false;
  const currentDate = new Date();

  // Check if threshold is breached
  if (
    threshold_type === THRESHOLD_TYPES.SALES_ONLY &&
    nexus.calculation.total_sales >= sales_threshold
  ) {
    nexus.is_nexus_breached = true;
    is_breached = true;
    nexus.date_of_breach = currentDate;
  }

  if (
    threshold_type === THRESHOLD_TYPES.SALES_OR_TRANSACTIONS &&
    (nexus.calculation.total_sales >= sales_threshold ||
      (transactions_threshold &&
        nexus.calculation.total_transactions >= transactions_threshold))
  ) {
    nexus.is_nexus_breached = true;
    is_breached = true;
    nexus.date_of_breach = currentDate;
  }

  if (
    threshold_type === THRESHOLD_TYPES.SALES_AND_TRANSACTIONS &&
    nexus.calculation.total_sales >= sales_threshold &&
    transactions_threshold &&
    nexus.calculation.total_transactions >= transactions_threshold
  ) {
    nexus.is_nexus_breached = true;
    is_breached = true;
    nexus.date_of_breach = currentDate;
  }

  if (is_breached) {
    //TODO: send mail to admin that nexus threshold has been breached in the specified state and tax collection registeration is required
    return {
      status: true,
      state: nexus.state,
      stateCode: nexus.stateCode,
    };
    // await sendNexusTresholdEmail({
    //   email: "moses@omenai.app",
    //   state: nexus.state,
    // });
  }

  await nexus.save();
};

export const evaluateNexusThresholds = async (): Promise<void> => {
  const now = new Date();
  const bulkOperations: any[] = [];
  const historyBulkOperations: any[] = [];

  const mailNotifications: { admin: boolean; vendors: string[] } = {
    admin: false,
    vendors: [],
  };

  const allNexusStates = await NexusTransactions.find(
    {},
    {
      last_reset: 1,
      nexus_rule: 1,
      calculation: 1,
      tax_withholding_eligibility: 1,
      state: 1,
      stateCode: 1,
    }
  );

  await Promise.all(
    allNexusStates.map(async (nexus: NexusDocument & { _id: ObjectId }) => {
      const lastReset = nexus.last_reset ?? new Date();
      let shouldReset = false;

      if (nexus.tax_withholding_eligibility) {
        shouldReset = checkEvaluationPeriod(
          nexus.nexus_rule.evaluation_period_type,
          lastReset,
          now
        );
      } else {
        const salesExposure = nexus.calculation.sales_exposure_percentage ?? 0;
        const transactionExposure =
          nexus.calculation.transactions_exposure_percentage ?? 0;

        let exposureMet = false;
        switch (nexus.nexus_rule.threshold_type) {
          case THRESHOLD_TYPES.SALES_ONLY:
            exposureMet = salesExposure >= 95;
            break;
          case THRESHOLD_TYPES.SALES_OR_TRANSACTIONS:
            exposureMet = salesExposure >= 95 || transactionExposure >= 95;
            break;
          case THRESHOLD_TYPES.SALES_AND_TRANSACTIONS:
            exposureMet = salesExposure >= 95 && transactionExposure >= 95;
            break;
        }

        if (!exposureMet) {
          shouldReset = true;
        } else {
          mailNotifications.admin = true;
          mailNotifications.vendors.push(nexus.state);
          bulkOperations.push({
            updateOne: {
              filter: { _id: nexus._id },
              update: {
                $set: {
                  tax_withholding_eligibility: true,
                  date_of_breach: now,
                },
              },
            },
          });
        }
      }

      if (shouldReset) {
        bulkOperations.push({
          updateOne: {
            filter: { _id: nexus._id },
            update: {
              $set: {
                "calculation.total_sales": 0,
                "calculation.total_transactions": 0,
                is_nexus_breached: false,
                date_of_breach: null,
                last_reset: now,
              },
            },
          },
        });

        historyBulkOperations.push({
          state: nexus.state,
          stateCode: nexus.stateCode,
          evaluation_period_type: nexus.nexus_rule.evaluation_period_type,
          total_sales: nexus.calculation.total_sales,
          total_transactions: nexus.calculation.total_transactions,
          date_of_breach: nexus.date_of_breach,
          reset_date: now,
        });
      }
    })
  );

  // Bulk write operations
  if (bulkOperations.length > 0) {
    await NexusTransactions.bulkWrite(bulkOperations);
  }

  if (historyBulkOperations.length > 0) {
    await NexusTransactionHistoryModel.insertMany(historyBulkOperations);
  }

  // Send emails asynchronously
  // if (mailNotifications.admin) {
  //   sendAdminEmail(
  //     "Nexus Threshold Breached",
  //     "A nexus threshold has been breached."
  //   );
  // }
  // if (mailNotifications.vendors.length > 0) {
  //   sendBulkVendorEmails(mailNotifications.vendors);
  // }
};

// Helper function to check if evaluation period has expired
const checkEvaluationPeriod = (
  evaluationType: string,
  lastReset: Date,
  now: Date
): boolean => {
  switch (evaluationType) {
    case "PREVIOUS_CALENDAR_YEAR":
      return now.getFullYear() > lastReset.getFullYear();
    case "PREVIOUS_OR_CURRENT_CALENDAR_YEAR":
      return (
        now.getFullYear() > lastReset.getFullYear() ||
        (now.getFullYear() === lastReset.getFullYear() && now.getMonth() === 0)
      );
    case "ROLLING_12_MONTHS":
      return isBefore(lastReset, subMonths(now, 12));
    case "12_MONTHS_ENDING_SEPTEMBER_30":
      return (
        now.getMonth() === 9 &&
        now.getDate() === 30 &&
        lastReset.getFullYear() < now.getFullYear()
      );
    case "PREVIOUS_12_MONTHS":
      return isBefore(lastReset, subMonths(now, 12));
    default:
      return false;
  }
};
