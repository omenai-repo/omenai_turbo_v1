import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";

export const inputProperties: any = [];

export const gallery_signup_step_one = [
  {
    label: "Gallery name?",
    type: "text",
    placeholder: "Louvre museum",
    labelText: "name",
  },
  {
    label: "Email address",
    type: "email",
    placeholder: "Louvre museum",
    labelText: "email",
  },

  {
    label: "Admin name",
    type: "text",
    placeholder: "Jack bauer",
    labelText: "admin",
  },
];

export const gallery_signup_step_two = [
  {
    label: "Gallery country of operation",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: country_codes,
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
];

export const gallery_signup_step_three = [
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
  {
    label: "Gallery Description",
    type: "text",
    placeholder: "Tell us a bit more about your gallery",
    labelText: "description",
  },
];

export const gallery_signup_step_four = [
  {
    label: "Upload Gallery logo",
    type: "logo",
    placeholder: "********",
    labelText: "Logo",
  },
];
