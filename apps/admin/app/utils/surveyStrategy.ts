export interface SurveyStrategy {
  type: "opportunity" | "warning" | "validation";
  title: string;
  message: string;
  metric: string;
}

export const generateSurveyStrategy = (stats: any): SurveyStrategy[] => {
  const strategies: SurveyStrategy[] = [];

  // Helper: Get top item from array
  const topChallenge = stats.challenges_global[0];
  const topValue = stats.value_drivers_global[0];
  const topDiscovery = stats.discovery_split[0]; // Based on total

  if (!topChallenge) return strategies;

  // 1. Challenge-Based Strategy
  if (topChallenge._id === "price_provenance_transparency") {
    strategies.push({
      type: "warning",
      title: "Trust is the Barrier",
      message:
        "Users cited 'Transparency' as their #1 pain point. Prioritize 'Verified Pricing' and 'Certificate of Authenticity' badges features for launch.",
      metric: `${topChallenge.count} Votes`,
    });
  } else if (topChallenge._id === "artist_visibility") {
    strategies.push({
      type: "opportunity",
      title: "Marketing Focus: Visibility",
      message:
        "Artists are desperate for eyeballs. Your marketing should focus heavily on 'We help you get seen' rather than 'We help you sell'.",
      metric: `${topChallenge.count} Votes`,
    });
  }

  // 2. Value Driver Strategy
  if (topValue._id === "art_community") {
    strategies.push({
      type: "validation",
      title: "Community-First Approach",
      message:
        "Users want connection, not just a marketplace. Ensure comment sections and artist profiles are social-ready.",
      metric: "Top Driver",
    });
  }

  // 3. Discovery Strategy
  if (topDiscovery._id === "social_media") {
    strategies.push({
      type: "opportunity",
      title: "Social Integration",
      message:
        "Since most discovery happens on Social Media, ensure Omenai has 'One-Click Share to Instagram' features built-in.",
      metric: "Dominant Channel",
    });
  }

  return strategies;
};
