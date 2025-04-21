import { countries } from "../countryList";

export const uploadArtworkDetailInputMocks = [
  {
    name: "title",
    type: "text",
    label: "Title",
    required: true,
    placeholder: "Add artwork title or 'unknown'",
  },
  {
    name: "year",
    type: "text",
    label: "Year",
    required: true,
    placeholder: "YYYY",
  },
  {
    name: "medium",
    type: "select",
    label: "Medium",
    required: true,
    options: [
      "Photography",
      "Works on paper",
      "Acrylic on canvas/linen/panel",
      "Mixed media on paper/canvas",
      "Sculpture (Resin/plaster/clay)",
      "Oil on canvas/panel",
      "Sculpture (Bronze/stone/metal)",
    ],
  },
  {
    name: "rarity",
    type: "select",
    label: "Rarity",
    required: true,
    options: ["Unique", "Limited edition", "Open edition", "Uknown edition"],
  },

  {
    name: "materials",
    type: "text",
    label: "Materials",
    required: true,
    placeholder: "e.g Acrylic on canvas",
  },
  {
    name: "certificate_of_authenticity",
    type: "select",
    label: "Certificate of authenticity",
    required: true,
    options: ["Yes", "No"],
  },
  {
    name: "signature",
    type: "select",
    label: "Signature",
    required: true,
    options: ["By artist", "By gallery", "No signature"],
  },
  {
    name: "framing",
    type: "select",
    label: "Framing",
    required: true,
    options: ["Framed", "Not framed"],
  },
  {
    name: "artwork_description",
    type: "textarea",
    label: "Artwork description (optional)",
    required: false,
    placeholder: "Describe this art piece",
  },
];

export const uploadArtworkDimensionInputMocks = [
  {
    name: "height",
    type: "text",
    label: "Height",
    required: true,
    placeholder: "e.g 24cm",
  },
  {
    name: "width",
    type: "text",
    label: "Width",
    required: true,
    placeholder: "e.g 24cm",
  },
  {
    name: "weight",
    type: "text",
    label: "Weight",
    required: true,
    placeholder: "e.g 10kg",
  },
  {
    name: "depth",
    type: "text",
    label: "Depth (optional)",
    required: false,
    placeholder: "e.g 24cm",
  },
];
export const uploadArtworkPriceInputMocks = [
  {
    name: "currency",
    type: "select",
    label: "Currency",
    required: true,
    placeholder: "e.g 1200",
    currencies: [
      { name: "Australian Dollar (A$)", code: "AUD" },
      { name: "Euro (€)", code: "EUR" }, // Removed duplicate entries, pre-filled code
      { name: "West African CFA franc (CFA)", code: "XOF" }, // Removed duplicate entries, pre-filled code
      { name: "Botswana Pula (P)", code: "BWP" },
      { name: "Canadian Dollar (CA$)", code: "CAD" },
      { name: "Croatian Kuna (kn)", code: "HRK" },
      { name: "Czech Koruna (Kč)", code: "CZK" },
      { name: "Danish Krone (kr.)", code: "DKK" },
      { name: "Egyptian Pound (E£)", code: "EGP" },
      { name: "Ethiopian Birr (Br)", code: "ETB" },
      { name: "Gambian Dalasi (D)", code: "GMD" },
      { name: "Ghanaian Cedi (₵)", code: "GHS" },
      { name: "Icelandic Króna (kr.)", code: "ISK" },
      { name: "Japanese Yen (¥)", code: "JPY" },
      { name: "Kenyan Shilling (KSh)", code: "KES" },
      { name: "Mauritian Rupee (₨)", code: "MUR" },
      { name: "Moroccan Dirham (د.م.)", code: "MAD" }, // Might require adjustment based on currency data source
      { name: "Mozambican Metical (MTn)", code: "MZN" },
      { name: "Namibian Dollar ($)", code: "NAD" }, // Caution: same symbol as USD
      { name: "New Zealand Dollar ($)", code: "NZD" }, // Caution: same symbol as USD
      { name: "Nigerian Naira (₦)", code: "NGN" },
      { name: "Norwegian Krone (kr)", code: "NOK" },
      { name: "Polish Złoty (zł)", code: "PLN" },
      { name: "Qatari Riyal (﷼)", code: "QAR" },
      { name: "Rwandan Franc (Fr)", code: "RWF" },
      { name: "Singapore Dollar ($)", code: "SGD" }, // Caution: same symbol as USD
      { name: "South African Rand (R)", code: "ZAR" },
      { name: "South Korean Won (₩)", code: "KRW" },
      { name: "Swedish Krona (kr)", code: "SEK" },
      { name: "Swiss Franc (CHF)", code: "CHF" },
      { name: "Tanzanian Shilling (Sh)", code: "TZS" },
      { name: "Turkish Lira (₺)", code: "TRY" },
      { name: "UAE Dirham (د.إ.)", code: "AED" }, // Might require adjustment based on currency data source
      { name: "Pound Sterling (£)", code: "GBP" },
      { name: "US Dollar ($)", code: "USD" },
    ],
  },
  {
    name: "price",
    type: "text",
    label: "Price",
    required: true,
    placeholder: "e.g 1200",
  },

  {
    name: "shouldShowPrice",
    type: "select",
    label: "Display price",
    required: true,
    options: ["Yes", "No"],
  },
];

export const uploadArtistDetailsInputMocks = [
  {
    name: "artist",
    type: "text",
    label: "Artist name",
    required: true,
    placeholder: "Artist full name",
  },
  {
    name: "artist_birthyear",
    type: "text",
    label: "Birth year",
    required: true,
    placeholder: "Artist's birth year",
  },
  {
    name: "artist_country_origin",
    type: "select",
    label: "Country of origin",
    required: true,
    options: countries,
  },
];
