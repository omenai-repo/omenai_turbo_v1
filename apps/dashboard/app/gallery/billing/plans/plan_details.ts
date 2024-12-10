export type PlanProps = {
  name: string;
  monthly_price: { value: number; text: string };
  yearly_price: { value: number; text: string };
  benefits: string[];
  plan_id: string;
};
export const plan_details: PlanProps[] = [
  {
    name: "Basic",
    monthly_price: { value: 150, text: "$150" },
    yearly_price: { value: 1500, text: "$1500" },
    benefits: [
      "30% commission excl. tax**",
      "Up to 25 artwork uploads",
      "International payment management",
      "Custom tailored Performance dashboard",
    ],
    plan_id: process.env.NEXT_PUBLIC_BASIC_PLAN!,
  },
  {
    name: "Pro",
    monthly_price: { value: 250, text: "$250" },
    yearly_price: { value: 2500, text: "$2500" },
    benefits: [
      "Includes all Basic plan services",
      "20% commission excl. tax**",
      "Unlimited artwork uploads monthly",
      "Priority customer support",
    ],
    plan_id: process.env.NEXT_PUBLIC_PRO_PLAN!,
  },
  {
    name: "Premium",
    monthly_price: { value: 400, text: "$400" },
    yearly_price: { value: 4000, text: "$4000" },
    benefits: [
      "Includes all Basic & Pro plan services",
      "15% commission excl. tax**",
      "`Price on demand` feature on artworks",
      "Priority feature on hompage",
    ],
    plan_id: process.env.NEXT_PUBLIC_PREMIUM_PLAN!,
  },
];
