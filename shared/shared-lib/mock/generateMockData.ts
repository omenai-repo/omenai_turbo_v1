export const generateMockData = () => {
  const data = [];
  const entities = ["artist", "collector"];
  const buyingFreqs = ["frequently", "regularly", "rarely"];
  const education = ["degree", "workshop", "self-taught"];
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
  const deviceTypes = ["mobile", "desktop", "tablet"];

  for (let i = 0; i < 100; i++) {
    // 1. Determine Identity
    const isArtist = Math.random() > 0.4; // 60% Artists, 40% Collectors
    const entity = isArtist ? "artist" : "collector";
    const country = countries[Math.floor(Math.random() * countries.length)];

    // 2. Generate KPIs based on Entity
    let kpi = {};
    if (isArtist) {
      kpi = {
        years_of_practice: Math.floor(Math.random() * 15 + 1).toString(), // 1-15 years
        formal_education:
          education[Math.floor(Math.random() * education.length)],
        age: Math.floor(Math.random() * 40 + 25).toString(), // 25-65
        // Artists don't have buying frequency usually, but schema allows mixed
      };
    } else {
      kpi = {
        buying_frequency:
          buyingFreqs[Math.floor(Math.random() * buyingFreqs.length)],
        years_of_collecting: Math.floor(Math.random() * 20 + 1).toString(),
        collector_type: Math.random() > 0.5 ? "private" : "corporate",
      };
    }

    // 3. Generate Tech Stack (Correlated)
    // If mobile, likely iOS/Android. If desktop, likely Windows/Mac.
    const deviceType =
      deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    let osName = "Windows";
    let vendor = "unknown";
    let model = "unknown";

    if (deviceType === "mobile") {
      const isIos = Math.random() > 0.5;
      osName = isIos ? "iOS" : "Android";
      vendor = isIos ? "Apple" : "Samsung";
      model = isIos
        ? `iPhone ${Math.floor(Math.random() * 4 + 11)}`
        : "Galaxy S22";
    } else if (deviceType === "desktop") {
      osName = Math.random() > 0.5 ? "Mac OS" : "Windows";
      vendor = osName === "Mac OS" ? "Apple" : "Generic";
      model = "PC";
    }

    // 4. Marketing Source
    // Skew LinkedIn towards Collectors
    let source = sources[Math.floor(Math.random() * sources.length)];
    if (!isArtist && Math.random() > 0.6) source = "linkedin";

    data.push({
      email: `user${i}_${Math.random().toString(36).substring(7)}@example.com`,
      name: `Mock User ${i}`,
      country: country,
      entity: entity,
      kpi: kpi,
      marketing: {
        source: source,
        medium: source === "direct" || source === "google" ? "none" : "social",
        campaign: "waitlist_launch_2026",
        referrer: source === "google" ? "google.com" : "",
      },
      device: {
        type: deviceType,
        vendor: vendor,
        model: model,
      },
      os: {
        name: osName,
        version: "10.0",
      },
      browser: {
        name: "Chrome",
      },
    });
  }

  return data;
};

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
