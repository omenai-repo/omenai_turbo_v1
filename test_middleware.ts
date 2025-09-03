// // ===== TYPES & INTERFACES =====

// // types/subscription.ts
// export interface Customer {
//   _id: string;
//   email: string;
//   name: string;
//   stripeCustomerId?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Subscription {
//   _id: string;
//   customerId: string;
//   planId: string;
//   status: 'active' | 'past_due' | 'canceled' | 'incomplete';
//   currentPeriodEnd: Date;
//   paymentMethodId: string;
//   stripeCustomerId: string;
//   amount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Payment {
//   _id: string;
//   subscriptionId: string;
//   amount: number;
//   status: 'succeeded' | 'failed' | 'processing';
//   stripePaymentIntentId: string;
//   createdAt: Date;
// }

// export interface Plan {
//   _id: string;
//   name: string;
//   amount: number;
//   interval: 'monthly' | 'yearly';
//   features: string[];
// }

// // ===== MONGODB MODELS =====

// // lib/models/Customer.ts
// import mongoose, { Schema, Document } from 'mongoose';

// const CustomerSchema = new Schema({
//   email: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   stripeCustomerId: { type: String },
// }, { timestamps: true });

// export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// // lib/models/Subscription.ts
// import mongoose, { Schema } from 'mongoose';

// const SubscriptionSchema = new Schema({
//   customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
//   planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
//   status: {
//     type: String,
//     enum: ['active', 'past_due', 'canceled', 'incomplete'],
//     default: 'active'
//   },
//   currentPeriodEnd: { type: Date, required: true },
//   paymentMethodId: { type: String, required: true },
//   stripeCustomerId: { type: String, required: true },
//   amount: { type: Number, required: true },
// }, { timestamps: true });

// export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

// // lib/models/Payment.ts
// import mongoose, { Schema } from 'mongoose';

// const PaymentSchema = new Schema({
//   subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
//   amount: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ['succeeded', 'failed', 'processing'],
//     required: true
//   },
//   stripePaymentIntentId: { type: String, required: true },
// }, { timestamps: true });

// export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

// // lib/models/Plan.ts
// import mongoose, { Schema } from 'mongoose';

// const PlanSchema = new Schema({
//   name: { type: String, required: true },
//   amount: { type: Number, required: true },
//   interval: { type: String, enum: ['monthly', 'yearly'], required: true },
//   features: [{ type: String }],
// }, { timestamps: true });

// export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

// // ===== DATABASE CONNECTION =====

// // lib/mongodb.ts
// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// let cached = (global as any).mongoose;

// if (!cached) {
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default connectDB;

// // ===== STRIPE CONFIGURATION =====

// // lib/stripe.ts
// import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// });

// // ===== FRONTEND COMPONENT =====

// // components/SubscriptionForm.tsx
// 'use client';
// import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// interface SubscriptionFormProps {
//   customerId: string;
//   planId: string;
//   amount: number;
// }

// function PaymentForm({ customerId, planId, amount }: SubscriptionFormProps) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsProcessing(true);
//     setError(null);

//     if (!stripe || !elements) {
//       setError('Stripe has not loaded yet');
//       setIsProcessing(false);
//       return;
//     }

//     const cardElement = elements.getElement(CardElement);
//     if (!cardElement) {
//       setError('Card element not found');
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       // Create payment method
//       const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//       });

//       if (pmError) {
//         setError(pmError.message || 'Failed to create payment method');
//         setIsProcessing(false);
//         return;
//       }

//       // Send to your backend
//       const response = await fetch('/api/subscriptions/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           paymentMethodId: paymentMethod.id,
//           customerId,
//           planId,
//           amount
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to create subscription');
//       }

//       if (data.requiresAction) {
//         // Handle 3D Secure authentication
//         const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
//         if (confirmError) {
//           setError(confirmError.message || 'Payment confirmation failed');
//         } else {
//           setSuccess(true);
//         }
//       } else {
//         setSuccess(true);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An unexpected error occurred');
//     }

//     setIsProcessing(false);
//   };

//   if (success) {
//     return (
//       <div className="p-6 bg-green-50 rounded-lg">
//         <h3 className="text-green-800 font-semibold">Subscription Created!</h3>
//         <p className="text-green-600">Your subscription has been successfully activated.</p>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="p-4 border rounded-lg">
//         <CardElement
//           options={{
//             style: {
//               base: {
//                 fontSize: '16px',
//                 color: '#424770',
//                 '::placeholder': {
//                   color: '#aab7c4',
//                 },
//               },
//             },
//           }}
//         />
//       </div>

//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
//           {error}
//         </div>
//       )}

//       <button
//         type="submit"
//         disabled={!stripe || isProcessing}
//         className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//       >
//         {isProcessing ? 'Processing...' : `Subscribe for $${amount / 100}`}
//       </button>
//     </form>
//   );
// }

// export default function SubscriptionForm(props: SubscriptionFormProps) {
//   return (
//     <Elements stripe={stripePromise}>
//       <PaymentForm {...props} />
//     </Elements>
//   );
// }

// // ===== API ROUTES =====

// // pages/api/subscriptions/create.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '../../../lib/stripe';
// import connectDB from '../../../lib/mongodb';
// import Customer from '../../../lib/models/Customer';
// import Subscription from '../../../lib/models/Subscription';
// import Payment from '../../../lib/models/Payment';
// import Plan from '../../../lib/models/Plan';

// interface CreateSubscriptionRequest {
//   paymentMethodId: string;
//   customerId: string;
//   planId: string;
//   amount: number;
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     await connectDB();

//     const { paymentMethodId, customerId, planId, amount }: CreateSubscriptionRequest = req.body;

//     // Get customer from database
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     // Get or create Stripe customer
//     let stripeCustomer;
//     if (!customer.stripeCustomerId) {
//       stripeCustomer = await stripe.customers.create({
//         email: customer.email,
//         name: customer.name,
//         metadata: { internalCustomerId: customerId }
//       });

//       // Update customer with Stripe ID
//       customer.stripeCustomerId = stripeCustomer.id;
//       await customer.save();
//     } else {
//       stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
//     }

//     // Create the initial payment intent with card saving
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: 'usd',
//       customer: stripeCustomer.id,
//       payment_method: paymentMethodId,
//       confirmation_method: 'manual',
//       confirm: true,
//       setup_future_usage: 'off_session',
//       metadata: {
//         type: 'subscription_initial',
//         customerId,
//         planId
//       }
//     });

//     // Handle the payment intent status
//     if (paymentIntent.status === 'requires_action') {
//       return res.json({
//         requiresAction: true,
//         clientSecret: paymentIntent.client_secret
//       });
//     }

//     if (paymentIntent.status === 'succeeded') {
//       // Create subscription record
//       const nextBillingDate = new Date();
//       nextBillingDate.setDate(nextBillingDate.getDate() + 30); // 30 days from now

//       const subscription = new Subscription({
//         customerId,
//         planId,
//         status: 'active',
//         currentPeriodEnd: nextBillingDate,
//         paymentMethodId,
//         stripeCustomerId: stripeCustomer.id,
//         amount
//       });

//       await subscription.save();

//       // Record the initial payment
//       const payment = new Payment({
//         subscriptionId: subscription._id,
//         amount,
//         status: 'succeeded',
//         stripePaymentIntentId: paymentIntent.id
//       });

//       await payment.save();

//       return res.json({
//         success: true,
//         subscriptionId: subscription._id
//       });
//     }

//     return res.status(400).json({
//       error: 'Payment failed',
//       status: paymentIntent.status
//     });

//   } catch (error: any) {
//     console.error('Subscription creation failed:', error);
//     return res.status(500).json({ error: error.message });
//   }
// }

// // pages/api/webhooks/stripe.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '../../../lib/stripe';
// import connectDB from '../../../lib/mongodb';
// import Payment from '../../../lib/models/Payment';
// import Subscription from '../../../lib/models/Subscription';
// import Stripe from 'stripe';

// // Disable body parsing for webhooks
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Helper to read raw body
// async function getRawBody(req: NextApiRequest): Promise<Buffer> {
//   const chunks: Buffer[] = [];

//   return new Promise((resolve, reject) => {
//     req.on('data', (chunk) => chunks.push(chunk));
//     req.on('end', () => resolve(Buffer.concat(chunks)));
//     req.on('error', reject);
//   });
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const sig = req.headers['stripe-signature'] as string;
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//   let event: Stripe.Event;

//   try {
//     const rawBody = await getRawBody(req);
//     event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
//   } catch (err: any) {
//     console.error('Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   await connectDB();

//   try {
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
//         break;

//       case 'payment_intent.payment_failed':
//         await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
//         break;

//       case 'payment_method.attached':
//         console.log('Payment method attached:', event.data.object);
//         break;

//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.json({ received: true });
//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     res.status(500).json({ error: 'Webhook processing failed' });
//   }
// }

// async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
//   console.log('Payment succeeded:', paymentIntent.id);

//   if (paymentIntent.metadata.type === 'subscription_recurring') {
//     // Update payment record
//     await Payment.findOneAndUpdate(
//       { stripePaymentIntentId: paymentIntent.id },
//       { status: 'succeeded' }
//     );

//     // Update subscription's next billing date
//     const subscriptionId = paymentIntent.metadata.subscriptionId;
//     const nextBillingDate = new Date();
//     nextBillingDate.setDate(nextBillingDate.getDate() + 30);

//     await Subscription.findByIdAndUpdate(subscriptionId, {
//       currentPeriodEnd: nextBillingDate,
//       status: 'active'
//     });
//   }
// }

// async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
//   console.log('Payment failed:', paymentIntent.id);

//   if (paymentIntent.metadata.type === 'subscription_recurring') {
//     await Payment.findOneAndUpdate(
//       { stripePaymentIntentId: paymentIntent.id },
//       { status: 'failed' }
//     );

//     // Mark subscription as past_due
//     const subscriptionId = paymentIntent.metadata.subscriptionId;
//     await Subscription.findByIdAndUpdate(subscriptionId, {
//       status: 'past_due'
//     });

//     // Handle failed payment retry logic here
//     await handleFailedPaymentRetry(subscriptionId);
//   }
// }

// async function handleFailedPaymentRetry(subscriptionId: string) {
//   // Get failed payment count in last 24 hours
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);

//   const failedPayments = await Payment.countDocuments({
//     subscriptionId,
//     status: 'failed',
//     createdAt: { $gte: yesterday }
//   });

//   if (failedPayments < 3) {
//     // Retry logic would go here - you might use a queue system like Bull
//     console.log(`Scheduling retry for subscription ${subscriptionId}`);
//   } else {
//     // Cancel subscription after 3 failed attempts
//     await Subscription.findByIdAndUpdate(subscriptionId, {
//       status: 'canceled'
//     });
//     console.log(`Subscription ${subscriptionId} canceled due to repeated payment failures`);
//   }
// }

// // ===== CRON JOB API ROUTE =====

// // pages/api/cron/process-subscriptions.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '../../../lib/stripe';
// import connectDB from '../../../lib/mongodb';
// import Subscription from '../../../lib/models/Subscription';
// import Payment from '../../../lib/models/Payment';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   // Verify cron secret for security
//   const cronSecret = req.headers['authorization'];
//   if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     await connectDB();
//     await processRecurringPayments();
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Cron job failed:', error);
//     res.status(500).json({ error: 'Failed to process subscriptions' });
//   }
// }

// async function processRecurringPayments() {
//   console.log('Processing recurring payments...');

//   const now = new Date();
//   const dueSubscriptions = await Subscription.find({
//     status: 'active',
//     currentPeriodEnd: { $lte: now }
//   }).populate('customerId');

//   for (const subscription of dueSubscriptions) {
//     try {
//       await processSubscriptionPayment(subscription);
//     } catch (error) {
//       console.error(`Failed to process subscription ${subscription._id}:`, error);
//     }
//   }
// }

// async function processSubscriptionPayment(subscription: any) {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: subscription.amount,
//       currency: 'usd',
//       customer: subscription.stripeCustomerId,
//       payment_method: subscription.paymentMethodId,
//       confirmation_method: 'manual',
//       confirm: true,
//       off_session: true,
//       metadata: {
//         type: 'subscription_recurring',
//         subscriptionId: subscription._id.toString(),
//         customerId: subscription.customerId._id.toString()
//       }
//     });

//     // Create payment record
//     const payment = new Payment({
//       subscriptionId: subscription._id,
//       amount: subscription.amount,
//       status: 'processing',
//       stripePaymentIntentId: paymentIntent.id
//     });

//     await payment.save();
//     console.log(`Recurring payment processed for subscription ${subscription._id}`);

//   } catch (error: any) {
//     if (error.code === 'authentication_required') {
//       console.log(`3D Secure required for subscription ${subscription._id}`);
//       await handleAuthenticationRequired(subscription, error.payment_intent);
//     } else {
//       console.error(`Payment failed for subscription ${subscription._id}:`, error);
//     }
//   }
// }

// async function handleAuthenticationRequired(subscription: any, paymentIntent: Stripe.PaymentIntent) {
//   await Subscription.findByIdAndUpdate(subscription._id, {
//     status: 'incomplete'
//   });

//   // Here you would send an email to the customer
//   // You can integrate with services like SendGrid, Nodemailer, etc.
//   console.log(`Send authentication email to ${subscription.customerId.email}`);
//   console.log(`Client secret: ${paymentIntent.client_secret}`);
// }

// // ===== ADDITIONAL API ROUTES =====

// // pages/api/subscriptions/update-payment-method.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '../../../lib/stripe';
// import connectDB from '../../../lib/mongodb';
// import Subscription from '../../../lib/models/Subscription';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     await connectDB();

//     const { subscriptionId, paymentMethodId } = req.body;

//     const subscription = await Subscription.findById(subscriptionId);
//     if (!subscription) {
//       return res.status(404).json({ error: 'Subscription not found' });
//     }

//     // Attach new payment method to customer
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: subscription.stripeCustomerId,
//     });

//     // Update subscription record
//     subscription.paymentMethodId = paymentMethodId;
//     await subscription.save();

//     res.json({ success: true });
//   } catch (error: any) {
//     console.error('Update payment method failed:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

// // pages/api/subscriptions/cancel.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import connectDB from '../../../lib/mongodb';
// import Subscription from '../../../lib/models/Subscription';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     await connectDB();

//     const { subscriptionId } = req.body;

//     await Subscription.findByIdAndUpdate(subscriptionId, {
//       status: 'canceled'
//     });

//     res.json({ success: true });
//   } catch (error: any) {
//     console.error('Cancel subscription failed:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

// // ===== ENVIRONMENT VARIABLES (.env.local) =====
// /*
// MONGODB_URI=mongodb://localhost:27017/your-database
// STRIPE_PUBLISHABLE_KEY=pk_test_...
// STRIPE_SECRET_KEY=sk_test_...
// STRIPE_WEBHOOK_SECRET=whsec_...
// CRON_SECRET=your-secure-random-string
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
// */

// // ===== PACKAGE.JSON DEPENDENCIES =====
// /*
// {
//   "dependencies": {
//     "@stripe/react-stripe-js": "^2.4.0",
//     "@stripe/stripe-js": "^2.4.0",
//     "mongoose": "^8.0.0",
//     "stripe": "^14.0.0"
//   }
// }
// */

// FLW

// async function handleSubscriptionPayment(
//   verified_transaction: any,
//   req: any,
//   session: any
// ) {
//   const existingTransaction = await SubscriptionTransactions.findOne({
//     reference: req.data.id,
//   });

//   if (existingTransaction) {
//     return NextResponse.json({ status: 200 });
//   }
//   const currency = getCurrencySymbol("USD");
//   const date = toUTCDate(new Date());

//   const parts = verified_transaction.data.tx_ref.split("&");

//   const [ref, gallery_id, plan_id, plan_interval, charge_type] = parts;

//   if (parts.length !== 5) {
//     console.error("Unexpected tx_ref format");
//     return NextResponse.json({ status: 401 });
//   }
//   const data: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
//     amount: formatPrice(verified_transaction.data.amount, currency),
//     date,
//     gallery_id,
//     payment_ref: verified_transaction.data.id,
//     status: verified_transaction.data.status,
//     stripe_customer_id: "",
//   };

//   if (verified_transaction.data.status === "failed") {
//     const update_transaction = await SubscriptionTransactions.findOneAndUpdate(
//       { payment_ref: verified_transaction.data.id },
//       { $set: data },
//       { session, upsert: true, new: true }
//     );

//     if (
//       update_transaction.modifiedCount === 0 &&
//       !update_transaction.upsertedId
//     ) {
//       return NextResponse.json({ status: 401 });
//     }
//     if (charge_type !== "card_change")
//       sendSubscriptionPaymentFailedMail({
//         name: req.data.customer.name,
//         email: req.data.customer.email,
//       }).catch((err) =>
//         console.error("Failed to send subscription payment failed email:", err)
//       );

//     return NextResponse.json({ status: 200 });
//   }

//   if (
//     verified_transaction.data.status === "pending" &&
//     verified_transaction.data.tx_ref === req.data.tx_ref &&
//     verified_transaction.data.amount === req.data.amount &&
//     verified_transaction.data.currency === req.data.currency
//   ) {
//     try {
//       //TODO: Handle pending status if necessary
//       if (charge_type === "card_change") {
//         // TODO: Handle card change pending status if necessary
//         // TODO: Send card change pending email if necessary
//         return NextResponse.json({ status: 200 });
//       }

//       const data: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
//         amount: formatPrice(verified_transaction.data.amount, currency),
//         date,
//         gallery_id,
//         payment_ref: verified_transaction.data.id,
//         status: verified_transaction.data.status,
//         stripe_customer_id: "",
//       };
//       const update_transaction = await SubscriptionTransactions.create([data], {
//         session,
//       });

//       if (!update_transaction) {
//         console.error("Failed to create subscription transaction");
//         return NextResponse.json({ status: 401 });
//       }
//     } catch (error) {
//       console.error("An error occurred during the transaction:", error);
//       return NextResponse.json({ status: 401 });
//     }

//     await sendSubscriptionPaymentPendingMail({
//       name: req.data.customer.name,
//       email: req.data.customer.email,
//     });

//     return NextResponse.json({ status: 200 });
//   }
//   if (
//     verified_transaction.data.status === "successful" &&
//     verified_transaction.data.tx_ref === req.data.tx_ref &&
//     verified_transaction.data.amount === req.data.amount &&
//     verified_transaction.data.currency === req.data.currency
//   ) {
//     try {
//       session.startTransaction();

//       if (charge_type === "card_change") {
//         await Subscriptions.updateOne(
//           { "customer.gallery_id": gallery_id },
//           {
//             $set: {
//               card: verified_transaction.data.card,
//             },
//           }
//         ).session(session);

//         await Proration.findOneAndUpdate(
//           { gallery_id },
//           { $inc: { value: 1 } },
//           { upsert: true, new: true, setDefaultsOnInsert: true }
//         ).session(session);
//         //TODO: Send a mail after card change
//         await session.commitTransaction();

//         return NextResponse.json({ status: 200 });
//       } else {
//         const update_transaction =
//           await SubscriptionTransactions.findOneAndUpdate(
//             { reference: verified_transaction.data.id },
//             { $set: data },
//             { session, upsert: true, new: true }
//           );

//         const found_customer = await Subscriptions.findOne({
//           "customer.gallery_id": gallery_id,
//         }).session(session);

//         const expiry_date = getSubscriptionExpiryDate(plan_interval);

//         const plan = await SubscriptionPlan.findOne({ plan_id }).session(
//           session
//         );

//         console.log(verified_transaction.data.card);

//         const subscription_data = {
//           card: verified_transaction.data.card,
//           start_date: date.toISOString(),
//           expiry_date: expiry_date.toISOString(),
//           status: "active",
//           payment: {
//             value: verified_transaction.data.amount,
//             currency: "USD",
//             type: verified_transaction.data.payment_type,
//             flw_ref: verified_transaction.data.flw_ref,
//             status: verified_transaction.data.status,
//             trans_ref: update_transaction.trans_id,
//           },
//           customer: {
//             ...verified_transaction.data.customer,
//             gallery_id,
//           },
//           plan_details: {
//             type: plan.name,
//             value: plan.pricing,
//             currency: plan.currency,
//             interval: plan_interval,
//           },
//           next_charge_params: {
//             value:
//               plan_interval === "monthly"
//                 ? +plan.pricing.monthly_price
//                 : +plan.pricing.annual_price,
//             currency: "USD",
//             type: plan.name,
//             interval: plan_interval,
//             id: plan._id,
//           },
//           upload_tracker: {
//             limit: getUploadLimitLookup(plan.name, plan_interval),
//             next_reset_date: expiry_date.toISOString(),
//             upload_count: 0,
//           },
//         };

//         if (!found_customer) {
//           await Subscriptions.create([subscription_data], { session });
//         } else {
//           const date = toUTCDate(new Date());
//           if (
//             found_customer.status === "active" &&
//             new Date(toUTCDate(found_customer.expiry_date)) > date
//           ) {
//             const upload_tracker = {
//               limit: getUploadLimitLookup(plan.name, plan_interval),
//               next_reset_date: expiry_date.toISOString(),
//               upload_count: found_customer.upload_tracker.upload_count,
//             };

//             await Subscriptions.updateOne(
//               { "customer.gallery_id": gallery_id },
//               { $set: { ...subscription_data, upload_tracker } }
//             ).session(session);
//           } else
//             await Subscriptions.updateOne(
//               { "customer.gallery_id": gallery_id },
//               { $set: subscription_data }
//             ).session(session);
//         }

//         await AccountGallery.updateOne(
//           { gallery_id },
//           {
//             $set: {
//               subscription_status: { type: plan.name, active: true },
//             },
//           }
//         ).session(session);
//         await session.commitTransaction();
//       }
//     } catch (error) {
//       console.error("An error occurred during the transaction:", error);
//       await session.abortTransaction();
//       return NextResponse.json({ status: 401 });
//     } finally {
//       await session.endSession();
//     }

//     await sendSubscriptionPaymentSuccessfulMail({
//       name: req.data.customer.name,
//       email: req.data.customer.email,
//     });

//     return NextResponse.json({ status: 200 });
//   } else {
//     return NextResponse.json({ status: 200 });
//   }
// }

import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Proration } from "@omenai/shared-models/models/prorations/ProrationSchemaModel";
import {
  SubscriptionPlan,
  Subscriptions,
} from "@omenai/shared-models/models/subscriptions/index";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";
async function verifyWebhookSignature(
  signature: string | null,
  secretHash: string
): Promise<boolean> {
  if (!signature) return false;

  const signatureBuffer = Buffer.from(signature, "utf8");
  const secretHashBuffer = Buffer.from(secretHash, "utf8");

  if (signatureBuffer.length !== secretHashBuffer.length) return false;

  return crypto.timingSafeEqual(
    new Uint8Array(signatureBuffer),
    new Uint8Array(secretHashBuffer)
  );
}

async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<any> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) throw new Error("Transaction verification failed");
  return await response.json();
}

async function handlePurchaseTransaction(
  verified_transaction: any,
  req: any,
  session: any
) {
  const meta = verified_transaction.data.meta;

  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
  });
  if (verified_transaction.data.status === "failed") {
    //DONE: Send email to user about failed payment
    await sendPaymentFailedMail({
      email: meta.buyer_email,
      name: order_info.buyer_details.name,
      artwork: order_info.artwork_data.title,
    });

    return NextResponse.json({ status: 200 });
  }

  if (verified_transaction.data.status === "pending") {
    return NextResponse.json({ status: 401 });
  }

  if (
    verified_transaction.data.status === "successful" &&
    verified_transaction.data.tx_ref === req.data.tx_ref &&
    verified_transaction.data.amount === req.data.amount &&
    verified_transaction.data.currency === req.data.currency
  ) {
    let transaction_id;

    const formatted_date = getFormattedDateTime();
    const currency = getCurrencySymbol("USD");

    await CreateOrder.updateOne(
      { order_id: order_info.order_id },
      { $set: { hold_status: null } }
    );
    try {
      const date = toUTCDate(new Date());
      session.startTransaction();

      const existingTransaction = await PurchaseTransactions.findOne({
        trans_reference: req.data.id,
      }).session(session);

      if (existingTransaction) {
        session.abortTransaction();
        return NextResponse.json({ status: 200 });
      }

      // Update payment information in order
      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: formatPrice(
          verified_transaction.data.amount,
          currency
        ),
        transaction_date: formatted_date,
        transaction_reference: verified_transaction.data.id,
      };

      const updateOrderPromise = CreateOrder.updateOne(
        {
          "buyer_details.email": meta.buyer_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        }
      ).session(session);

      const commission = Math.round(
        0.5 * Number(meta.unit_price) +
          Number(meta.shipping_cost) +
          Number(meta.tax_fees || 0)
      );

      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(verified_transaction.data.amount),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission,
        tax_fees: Math.round(+meta.tax_fees),
      };

      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "artist",
        trans_reference: verified_transaction.data.id,
        status: verified_transaction.data.status,
      };

      const createTransactionPromise = PurchaseTransactions.create([data], {
        session,
      });

      const updateArtworkPromise = Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } }
      ).session(session);

      const { month, year } = getCurrentMonthAndYear();
      const activity = {
        month,
        year,
        value: meta.unit_price,
        id: meta.seller_id,
        trans_ref: data.trans_reference,
      };

      const createSalesActivityPromise = SalesActivity.create([activity], {
        session,
      });

      const updateManyOrdersPromise = CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } }
      ).session(session);

      // Update the wallet balance

      const wallet_increment_amount = Math.round(
        verified_transaction.data.amount -
          (commission + Number(meta.tax_fees || 0) + Number(meta.shipping_cost))
      );

      const fund_wallet = await Wallet.updateOne(
        { owner_id: meta.seller_id },
        {
          $inc: {
            pending_balance: wallet_increment_amount,
          },
        }
      );
      const [createTransactionResult] = await Promise.all([
        createTransactionPromise,
        updateOrderPromise,
        updateArtworkPromise,
        createSalesActivityPromise,
        updateManyOrdersPromise,
        fund_wallet,
      ]);

      transaction_id = createTransactionResult[0].trans_id;

      await session.commitTransaction();
      console.log("Transaction committed.");
    } catch (error) {
      console.error("An error occurred during the transaction:", error);
      await session.abortTransaction();
      return NextResponse.json({ status: 400 });
    } finally {
      await session.endSession();
    }

    const buyer_push_token = await DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token"
    );
    const seller_push_token = await DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token"
    );
    const notificationPromises = [];

    // Check for actual token value, not just document existence
    if (buyer_push_token?.device_push_token) {
      const buyer_notif_payload: NotificationPayload = {
        to: buyer_push_token.device_push_token, // Extract the actual token
        title: "Payment successful",
        body: `Your payment for ${order_info.artwork_data.title} has been confirmed`,
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {
            orderId: order_info.order_id,
            date: toUTCDate(new Date()),
          },
          userId: order_info.buyer_details.id,
        },
      };

      notificationPromises
        .push
        // createWorkflow(
        //   "/api/workflows/notification/pushNotification",
        //   `notification_workflow_buyer_${order_info.order_id}_${generateDigit(2)}`,
        //   JSON.stringify(buyer_notif_payload)
        // ).catch((error) => {
        //   console.error("Failed to send buyer notification:", error);
        // })
        ();
    }

    if (seller_push_token?.device_push_token) {
      const seller_notif_payload: NotificationPayload = {
        to: seller_push_token.device_push_token, // Extract the actual token
        title: "Payment received",
        body: `A payment of ${formatPrice(order_info.artwork_data.pricing.usd_price, "USD")} has been made for your artpiece`,
        data: {
          type: "orders",
          access_type: order_info.seller_designation as "artist",
          metadata: {
            orderId: order_info.order_id,
            date: toUTCDate(new Date()),
          },
          userId: order_info.seller_details.id,
        },
      };

      notificationPromises
        .push
        // createWorkflow(
        //   "/api/workflows/notification/pushNotification",
        //   `notification_workflow_seller_${order_info.order_id}_${generateDigit(2)}`,
        //   JSON.stringify(seller_notif_payload)
        // ).catch((error) => {
        //   console.error("Failed to send seller notification:", error);
        // })
        ();
    }
    const price = formatPrice(verified_transaction.data.amount, currency);

    await Promise.all([
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${generateDigit(6)}`,
        JSON.stringify({ order_id: order_info.order_id })
      ),
      createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail${generateDigit(6)}`,
        JSON.stringify({
          buyer_email: order_info.buyer_details.email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id: transaction_id,
          price,
          seller_email: order_info.seller_details.email,
          seller_name: order_info.seller_details.name,
        })
      ),
      ...notificationPromises,
    ]);

    return NextResponse.json({ status: 200 });
  } else {
    return NextResponse.json({ status: 200 });
  }
}

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  const secretHash = process.env.FLW_SECRET_HASH!;
  const signature = request.headers.get("verif-hash");
  const isValid = await verifyWebhookSignature(signature, secretHash);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 }
    );
  }

  const req = await request.json();

  if (req.event === "charge.completed") {
    // Verify transaction with flw api
    const verified_transaction = await verifyFlutterwaveTransaction(
      req.data.id
    );

    const transactionType =
      verified_transaction.data.meta !== null ? "purchase" : "subscription";
    // Spin up DB Server
    const client = await connectMongoDB();
    const session = await client.startSession();

    // if (transactionType === "subscription") {
    //   // await handleSubscriptionPayment(verified_transaction, req, session);
    // } else {
    await handlePurchaseTransaction(verified_transaction, req, session);
    // }
  }

  return NextResponse.json({ status: 200 });
});
