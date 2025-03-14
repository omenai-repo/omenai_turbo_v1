import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";
import { InputProps } from "@omenai/shared-types";

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
    label: "Gallery country of operation",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: country_codes,
  },

  {
    label: "Address line",
    type: "text",
    placeholder: "e.g 79, example street",
    labelText: "address_line",
    items: [],
  },
  {
    label: "City",
    type: "text",
    placeholder: "Prague",
    labelText: "city",
  },
  {
    label: "State",
    type: "select",
    labelText: "state",
    placeholder: "Select option",
    items: [],
  },
  {
    label: "Postal code",
    type: "text",
    placeholder: "Your region's postal code",
    labelText: "zip",
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
