// Define the structure for a single step/question
interface OnboardingOption {
  question: string;
  type: "text" | "select" | "cv" | "socials" | "confirmation";
  label: string;
  options?: string[];
  placeholder?: string;
}

export const onboardingOptions: OnboardingOption[] = [
  {
    question:
      "Describe yourself and your art style (This would be publicly visible)",
    type: "text",
    label: "bio",
    placeholder:
      "e.g., I create abstract expressionist oil paintings focusing on the emotional landscape...",
  },
  {
    question: "Are you a Graduate from an accredited art institution?",
    type: "select",
    label: "graduate",
    options: ["Yes", "No"],
  },
  {
    question: "Do you have an MFA (Masters in Fine Arts)?",
    type: "select",
    label: "mfa",
    options: ["Yes", "No"],
  },
  {
    question: "How many solo exhibitions have you had? (approximate)",
    type: "text",
    label: "solo",
    placeholder: "Enter number (e.g., 3)",
  },
  {
    question: "How many group exhibitions have you had? (approximate)",
    type: "text",
    label: "group",
    placeholder: "Enter number (e.g., 12)",
  },
  {
    question: "Which Bienalle have you participated in?",
    type: "select",
    label: "biennale",
    options: ["Venice", "Other recognized Biennale events", "None"],
  },
  {
    question: "Have you been featured in an Art Fair by a gallery?",
    type: "select",
    label: "art_fair",
    options: ["Yes", "No"],
  },
  {
    question: "Have your piece been featured in any Museum Exhibition?",
    type: "select",
    label: "museum_exhibition",
    options: ["Yes", "No"],
  },
  {
    question: "Is your work featured in any Museum Collection?",
    type: "select",
    label: "museum_collection",
    options: ["Yes", "No"],
  },
  {
    question: "Upload your Artist CV (Curriculum Vitae)",
    type: "cv",
    label: "cv",
  },
  {
    question:
      "Connect your professional social media accounts (Instagram, etc.)",
    type: "socials",
    label: "socials",
  },
  {
    question: "Review and Submit Your Artist Profile",
    type: "confirmation",
    label: "confirmation", // Label isn't strictly needed for confirmation but good for typing
  },
];
