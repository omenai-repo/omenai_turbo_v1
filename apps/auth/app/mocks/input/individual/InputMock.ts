import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";
import { InputProps } from "@omenai/shared-types";
import { Country, ICountry } from "country-state-city";
export const user_signup_step_one = [
  {
    label: "Full name",
    type: "text",
    placeholder: "Jack Bauear",
    labelText: "name",
    id: 0,
  },
  {
    label: "Email address",
    type: "email",
    placeholder: "johndoe@example.com",
    labelText: "email",
    id: 1,
  },
];
export const user_signup_step_two = [
  {
    label: "Country of residence",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: Country.getAllCountries() as ICountry[],
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
    label: "Address line 1",
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
    label: "Phone number",
    type: "text",
    placeholder: "+12345678901",
    labelText: "phone",
  },
];
export const user_signup_step_three = [
  {
    label: "Setup a password to secure your account",
    type: "password",
    placeholder: "********",
    labelText: "password",
    id: 2,
  },
  {
    label: "Just to be sure, please confirm your password",
    type: "password",
    placeholder: "********",
    labelText: "confirmPassword",
    id: 3,
  },
];

export const emails = ["dantereus1@gmail.com"];
