export const seedVisits = () => {
  const sources = [
    "twitter",
    "linkedin",
    "instagram",
    "google",
    "direct",
    "founder_linkedIn",
    "whatsapp",
    "newsletter",
    "facebook",
    "referral",
    "other",
  ];
  const batchSize = 500; // Insert in chunks
  const targetVisits = 4000; // 200 leads / 4000 visits = 5% Conversion

  const visits = [];

  for (let i = 0; i < targetVisits; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const isMobile = Math.random() > 0.6; // 60% mobile traffic

    visits.push({
      visitorId: `mock_visitor_${Math.random().toString(36).substring(7)}`,
      source: source,
      medium: "social",
      campaign: "waitlist_launch_2026",
      referrer: source === "direct" ? "" : `https://${source}.com`,
      country: Math.random() > 0.3 ? "Nigeria" : "United States", // Mix of traffic
      device: {
        type: isMobile ? "mobile" : "desktop",
        vendor: isMobile ? "Samsung" : "Generic",
        model: isMobile ? "Galaxy S22" : "PC",
      },
      os: {
        name: isMobile ? "Android" : "Windows",
        version: "10",
      },
      browser: {
        name: "Chrome",
      },
      // Randomize dates over the last 3 days so the chart looks natural
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 72),
      ),
    });
  }

  return visits;
};

// await seedVisits();

export const generateMockData = () => {
  const data = [];
  const entities = ["artist", "collector"];

  // 1. Define Options exactly as they appear in your DB (Lowercase/Snake_case)
  const discoveryMethods = [
    "social_media",
    "galleries",
    "art_fairs",
    "online_marketplaces",
    "personal_network",
    "no_discovery_method",
  ];

  const challenges = [
    "artist_visibility",
    "personalized_art_discovery",
    "art_sales_balance",
    "price_provenance_transparency",
    "logistics_management",
    "art_overwhelm",
    "other",
  ];

  const valueDrivers = [
    "artist_discovery",
    "simplified_buy_sell",
    "art_community",
    "artist_collector_connection",
    "art_education_context",
    "early_access",
  ];

  const sources = [
    "twitter",
    "linkedin",
    "instagram",
    "google",
    "direct",
    "newsletter",
    "facebook",
    "referral",
    "other",
  ];
  const countries = [
    "Nigeria",
    "United States",
    "United Kingdom",
    "Ghana",
    "South Africa",
    "Canada",
    "Germany",
    "France",
    "Brazil",
    "Australia",
    "India",
    "Kenya",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Mexico",
    "Japan",
    "China",
    "Russia",
    "Turkey",
    "Egypt",
    "Argentina",
    "Colombia",
    "Chile",
    "Peru",
    "Poland",
    "Belgium",
    "Switzerland",
    "Austria",
    "Norway",
    "Denmark",
    "Finland",
    "Ireland",
    "New Zealand",
    "Portugal",
    "Czech Republic",
    "Hungary",
    "Greece",
    "South Korea",
  ];
  const buyingFreqs = ["frequently", "regularly", "rarely"];
  const education = ["degree", "workshop", "self-taught"];

  for (let i = 0; i < 100; i++) {
    const isArtist = Math.random() > 0.4; // 60% Artists
    const entity = isArtist ? "artist" : "collector";
    const country = countries[Math.floor(Math.random() * countries.length)];

    // 2. Generate Logic-Based Survey Answers
    let survey = {
      art_discovery_or_share_method: "",
      current_challenges: "",
      app_value_drivers: "",
    };

    if (isArtist) {
      // Artists care about Visibility and Sales
      survey.current_challenges =
        Math.random() > 0.3 ? "artist_visibility" : "art_sales_balance";

      survey.app_value_drivers =
        Math.random() > 0.5 ? "artist_collector_connection" : "art_community";

      survey.art_discovery_or_share_method = "social_media"; // Artists live on IG
    } else {
      // Collectors care about Transparency and Discovery
      survey.current_challenges =
        Math.random() > 0.4
          ? "price_provenance_transparency"
          : "personalized_art_discovery";

      survey.app_value_drivers =
        Math.random() > 0.5 ? "simplified_buy_sell" : "artist_discovery";

      survey.art_discovery_or_share_method =
        Math.random() > 0.5 ? "galleries" : "online_marketplaces";
    }

    // 3. Generate KPIs
    let kpi = {};
    if (isArtist) {
      kpi = {
        years_of_practice: Math.floor(Math.random() * 15 + 1).toString(),
        formal_education:
          education[Math.floor(Math.random() * education.length)],
      };
    } else {
      kpi = {
        buying_frequency:
          buyingFreqs[Math.floor(Math.random() * buyingFreqs.length)],
        years_of_collecting: Math.floor(Math.random() * 20 + 1).toString(),
        collector_type: Math.random() > 0.5 ? "private" : "corporate",
      };
    }

    // 4. Push User
    data.push({
      email: `user${i}_${Math.random().toString(36).substring(7)}@example.com`,
      name: `Mock User ${i}`,
      country: country,
      entity: entity,
      kpi: kpi,

      // The New Survey Field
      survey: survey,

      marketing: {
        source: isArtist ? "instagram" : "linkedin", // Correlate source too
        medium: "social",
        campaign: "launch_v1",
        referrer: "",
      },
      device: {
        type: Math.random() > 0.6 ? "mobile" : "desktop",
        vendor: "Apple",
        model: "iPhone 13",
      },
      os: { name: "iOS", version: "15" },
      browser: { name: "Safari" },
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7),
      ), // Last 7 days
    });
  }

  return data;
};
