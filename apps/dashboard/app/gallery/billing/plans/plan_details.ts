export type PlanProps = {
  name: string;
  monthly_price: { value: number; text: string };
  yearly_price: { value: number; text: string };
  benefits:
    | {
        annual: string[];
        monthly: string[];
      }
    | string[];
  plan_id: string;
};
export const plan_details: PlanProps[] = [
  {
    name: "Basic",
    monthly_price: { value: 75, text: "$75" },
    yearly_price: { value: 720, text: "$720" },
    benefits: {
      monthly: [
        "Keep 75% of sales revenue (25% platform commission) excl tax*",
        "Upload up to 15 artworks per month",
        "Global payment processing and management",
        "Personalized analytics and performance insights",
        "Fulfillment coordination from pickup alert to delivery tracking",
      ],
      annual: [
        "Keep 75% of sales revenue (25% platform commission) excl tax*",
        "Upload up to 180 artworks throughout the year",
        "Global payment processing and management",
        "Personalized analytics and performance insights",
        "Fulfillment coordination from pickup alert to delivery tracking",
      ],
    },
    plan_id: process.env.NEXT_PUBLIC_BASIC_PLAN!,
  },
  {
    name: "Pro",
    monthly_price: { value: 250, text: "$250" },
    yearly_price: { value: 2500, text: "$2500" },
    benefits: {
      monthly: [
        "Everything from Basic plan included",
        "Keep 80% of sales revenue (20% platform commission) excl tax*",
        "Upload up to 60 artworks per month",
        "Priority customer support and assistance",
        "Advanced analytics and performance insights",
        "Priority fulfillment coordination from pickup alert to delivery tracking",
      ],
      annual: [
        "Everything from Basic plan included",
        "Keep 80% of sales revenue (20% platform commission) excl tax*",
        "Upload up to 760 artworks throughout the year",
        "Priority customer support and assistance",
        "Advanced analytics and performance insights",
        "Priority fulfillment coordination from pickup alert to delivery tracking",
      ],
    },
    plan_id: process.env.NEXT_PUBLIC_PRO_PLAN!,
  },
  {
    name: "Premium",
    monthly_price: { value: 400, text: "$400" },
    yearly_price: { value: 4000, text: "$4000" },
    benefits: {
      monthly: [
        "Everything from Pro plan included",
        "Unlimited artwork uploads and submissions",
        "Keep 85% of sales revenue (15% platform commission) excl tax*",
        "Enable 'Price on demand' feature for artworks",
        "Priority eligibility for featured placements",
        "White glove fulfillment oversight and issue escalation",
      ],
      annual: [
        "Everything from Pro plan included",
        "Unlimited artwork uploads and submissions",
        "Keep 85% of sales revenue (15% platform fee) excl tax*",
        "Enable 'Price on demand' feature for artworks",
        "Priority eligibility for featured placements",
        "White glove fulfillment oversight and issue escalation",
      ],
    },
    plan_id: process.env.NEXT_PUBLIC_PREMIUM_PLAN!,
  },
];
