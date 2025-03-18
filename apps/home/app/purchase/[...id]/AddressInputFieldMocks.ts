import { Country } from "country-state-city";
export const userDetails = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    placeholder: "Enter your full name",
    required: true,
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    placeholder: "Enter your email address",
    required: true,
  },
];
export const userLocation = [
  {
    label: "Country",
    type: "select",
    labelText: "country",
    items: Country.getAllCountries(),
  },
  {
    label: "State",
    type: "select",
    labelText: "state",
    items: [],
  },
  {
    label: "City",
    type: "select",
    labelText: "city",
    items: [],
  },
  {
    label: "Address line",
    type: "text",
    placeholder: "e.g 79, example street",
    labelText: "address_line",
  },
  {
    label: "Postal code",
    type: "text",
    placeholder: "Your region's postal code",
    labelText: "zip",
  },
];
