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
    label: "Country of operation",
    type: "select",
    placeholder: "Select option",
    labelText: "country",
    items: country_codes,
  },

  {
    label: "Gallery address",
    type: "text",
    placeholder: "e.g 79, example street, London, England",
    labelText: "address",
    items: [],
  },
  {
    label: "Gallery description",
    type: "text",
    placeholder: "Tell us a bit more about your gallery",
    labelText: "description",
    items: [],
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
];

export const gallery_signup_step_four = [
  {
    label: "Upload Gallery logo",
    type: "logo",
    placeholder: "********",
    labelText: "Logo",
  },
];
