import { countries } from "../countryList";

export const uploadArtworkDetailInputMocks = [
  {
    name: "title",
    type: "text",
    label: "Title",
    required: true,
    placeholder: "Add artwork title here",
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
    options: ["By artist", "No signature"],
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
