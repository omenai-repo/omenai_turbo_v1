import { US_NEXUS_THRESHOLD_LIST } from "@omenai/shared-types";

export const nexus_thresholds: US_NEXUS_THRESHOLD_LIST[] = [
  {
    state: "Alabama",
    stateCode: "AL",
    nexus_rule: {
      sales_threshold: 250000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "Alaska",
    stateCode: "AK",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Arizona",
    stateCode: "AZ",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Arkansas",
    stateCode: "AR",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "California",
    stateCode: "CA",
    nexus_rule: {
      sales_threshold: 500000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Colorado",
    stateCode: "CO",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Connecticut",
    stateCode: "CT",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_AND_TRANSACTIONS",
      evaluation_period_type: "TWELVE_MONTHS_ENDING_SEPTEMBER_30",
    },
  },
  {
    state: "Florida",
    stateCode: "FL",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "Georgia",
    stateCode: "GA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Hawaii",
    stateCode: "HI",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Idaho",
    stateCode: "ID",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Illinois",
    stateCode: "IL",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "Indiana",
    stateCode: "IN",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Iowa",
    stateCode: "IA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Kansas",
    stateCode: "KS",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Kentucky",
    stateCode: "KY",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Louisiana",
    stateCode: "LA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Maine",
    stateCode: "ME",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Maryland",
    stateCode: "MD",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Massachusetts",
    stateCode: "MA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Michigan",
    stateCode: "MI",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "Minnesota",
    stateCode: "MN",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "Mississippi",
    stateCode: "MS",
    nexus_rule: {
      sales_threshold: 250000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "Missouri",
    stateCode: "MO",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },

  {
    state: "Nebraska",
    stateCode: "NE",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Nevada",
    stateCode: "NV",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "New Jersey",
    stateCode: "NJ",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_AND_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "New Mexico",
    stateCode: "NM",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "New York",
    stateCode: "NY",
    nexus_rule: {
      sales_threshold: 500000,
      transactions_threshold: 100,
      threshold_type: "SALES_AND_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "North Carolina",
    stateCode: "NC",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "North Dakota",
    stateCode: "ND",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Ohio",
    stateCode: "OH",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Oklahoma",
    stateCode: "OK",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },

  {
    state: "Pennsylvania",
    stateCode: "PA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Rhode Island",
    stateCode: "RI",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "South Carolina",
    stateCode: "SC",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "South Dakota",
    stateCode: "SD",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Tennessee",
    stateCode: "TN",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "Texas",
    stateCode: "TX",
    nexus_rule: {
      sales_threshold: 500000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_12_MONTHS",
    },
  },
  {
    state: "Utah",
    stateCode: "UT",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Puerto Rico",
    stateCode: "PR",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "Vermont",
    stateCode: "VT",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_CALENDAR_YEAR",
    },
  },
  {
    state: "Virginia",
    stateCode: "VA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Washington",
    stateCode: "WA",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "West Virginia",
    stateCode: "WV",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: 200,
      threshold_type: "SALES_OR_TRANSACTIONS",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Wisconsin",
    stateCode: "WI",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
  {
    state: "Wyoming",
    stateCode: "WY",
    nexus_rule: {
      sales_threshold: 100000,
      transactions_threshold: null,
      threshold_type: "SALES_ONLY",
      evaluation_period_type: "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
    },
  },
];
