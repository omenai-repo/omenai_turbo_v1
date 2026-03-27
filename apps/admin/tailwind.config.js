/** @type {import('tailwindcss').Config} */
const sharedConfig = require("@omenai/tailwind-config/tailwind.config.js");

module.exports = {
  // 1. Use presets instead of spreading. Tailwind will intelligently deep-merge this.
  presets: [sharedConfig],

  // 2. Define the paths specifically for THIS app, PLUS Tremor
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../shared/shared-ui-components/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
};
