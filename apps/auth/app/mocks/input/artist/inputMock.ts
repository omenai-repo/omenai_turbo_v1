import { artist_countries_codes_currency } from "@omenai/shared-json/src/artist_onboarding_countries";

export const inputProperties: any = [];

export const artist_signup_step_one = [
  {
    label: "Fullname",
    type: "text",
    placeholder: "e.g John Doe",
    labelText: "name",
  },
  {
    label: "Email address",
    type: "email",
    placeholder: "e.g johndoe@gmail.com",
    labelText: "email",
  },
];

export const artist_signup_step_two = [
  {
    label: "Country of residence",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: artist_countries_codes_currency,
  },
  {
    label: "State",
    type: "select",
    labelText: "state",
    placeholder: "Select option",
    items: [],
  },
  {
    label: "City",
    type: "select",
    placeholder: "Select option",
    labelText: "city",
    items: [],
  },
  {
    label: "Address line",
    type: "text",
    placeholder: "e.g 79, example street",
    labelText: "address_line",
    items: [],
  },
  {
    label: "Postal code",
    type: "text",
    placeholder: "Your region's postal code",
    labelText: "zip",
  },
  {
    label:
      "Phone number (Preferably a WhatsApp number to facilitate notifications via whatapp)",
    type: "text",
    placeholder: "e.g +12345678901",
    labelText: "phone",
  },
];

export const artist_signup_step_three = [
  {
    label: "Setup a password to secure your account",
    type: "password",
    placeholder: "********",
    labelText: "password",
  },
  {
    label: "Just to be sure, please confirm your password",
    type: "password",
    placeholder: "********",
    labelText: "confirmPassword",
  },
];

export const artist_signup_step_four = [
  {
    label: "Upload a logo or picture of yourself",
    type: "logo",
    placeholder: "********",
    labelText: "Logo",
  },
];
