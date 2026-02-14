// 1. The Exact Answers Map (from your provided data)
export const SURVEY_ANSWER_MAP: Record<string, string> = {
  // Challenges
  artist_visibility: "Getting visibility as an artist",
  personalized_art_discovery: "Discovering art that feels personal",
  art_sales_balance: "Balancing making art and managing sales",
  price_provenance_transparency: "Transparency with prices and provenance",
  logistics_management: "Dealing with logistics",
  art_overwhelm: "Feeling overwhelmed with all the art out there",
  other: "Something else",

  // Discovery
  social_media: "Social Media",
  galleries: "Galleries",
  art_fairs: "Art fairs",
  online_marketplaces: "Online Marketplaces",
  personal_network: "Personal network / word of mouth",
  no_discovery_method: "I don't have a good way yet",

  // Value Drivers
  artist_discovery: "Better discovery of new artists",
  simplified_buy_sell: "Simple tools to buy or sell art more easily",
  art_community: "A community for sharing knowledge and feedback",
  artist_collector_connection:
    "Direct connection between artists and collectors",
  art_education_context: "Education and context around art",
  early_access: "Early access to new artists, events or features",
};

// 2. The Translator Function
export const formatSurveyAnswer = (key: string | undefined) => {
  if (!key) return "N/A";
  // Check exact match
  if (SURVEY_ANSWER_MAP[key]) return SURVEY_ANSWER_MAP[key];

  // Check lowercase match (DB is lowercase, Map keys might be UPPERCASE in your types but we mapped them here)
  if (SURVEY_ANSWER_MAP[key.toLowerCase()])
    return SURVEY_ANSWER_MAP[key.toLowerCase()];

  // Fallback: Make snake_case readable just in case
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// 2. Helper to Format Text
export const formatSurveyText = (key: string) => {
  if (!key) return "Unknown";
  // Try direct map match
  if (SURVEY_ANSWER_MAP[key]) return SURVEY_ANSWER_MAP[key];
  // Fallback to capitalizing snake_case
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
