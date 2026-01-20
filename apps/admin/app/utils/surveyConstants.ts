// 1. The Mapping Dictionaries
export const QUESTION_MAP: Record<string, string> = {
  art_discovery_or_share_method: "How do you currently discover or share art?",
  current_challenges: "What are the main challenges you are facing right now?",
  app_value_drivers: "What would make an art app worth using regularly?",
};

export const ANSWER_MAP: Record<string, string> = {
  // Discovery
  social_media: "Social Media",
  galleries: "Galleries",
  art_fairs: "Art Fairs",
  online_marketplaces: "Online Marketplaces",
  personal_network: "Personal Network",
  no_discovery_method: "No good way yet",

  // Challenges
  artist_visibility: "Artist Visibility",
  personalized_art_discovery: "Personalized Discovery",
  art_sales_balance: "Sales/Art Balance",
  price_provenance_transparency: "Price Transparency",
  logistics_management: "Logistics",
  art_overwhelm: "Art Overwhelm",
  other: "Other",

  // Value Drivers
  artist_discovery: "Better Discovery",
  simplified_buy_sell: "Simplified Tools",
  art_community: "Community",
  artist_collector_connection: "Direct Connections",
  art_education_context: "Education/Context",
  early_access: "Early Access",
};

// 2. Helper to Format Text
export const formatSurveyText = (key: string) => {
  if (!key) return "Unknown";
  // Try direct map match
  if (ANSWER_MAP[key]) return ANSWER_MAP[key];
  // Fallback to capitalizing snake_case
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
