/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
      },
      center: true,
    },
    fontSize: {
      xxxs: "0.56rem",
      xxs: "0.625rem",
      xs: "0.8125rem",
      base: "1rem",
      sm: "1.2rem",
      md: "1.44rem",
      lg: "1.625rem",
      xl: "2.074rem",
      "2xl": "2.488rem",
      "3xl": "2.986rem",
    },
    extend: {
      colors: {
        primary: "#2A9EDF",
        dark: "#030303",
        gray: {
          200: "#47748E",
          300: "#F6F6F6",
          400: "#F4F4F4",
          800: "#FCFCFC",
          light: "#818181",
        },

        line: "#DEDEDE",
        authSideDark: "#1A1A1A",
      },
      gridTemplateColumns: {
        "3cols": "repeat(3, minmax(0, 1fr))",
        // Add more custom grid templates as needed
      },
      screens: {
        xs: "460px",
        xxl: "400px",
        xxm: "380px",
        xxs: "320px",
        md: "768px",
        xl: "1280px",
        "2lg": "1024px",
        "2xl": "1440px",
        "3xl": "1560px",
      },
      fontFamily: {
        sans: ["var(--font-nunito_sans)"],
      },

      backgroundImage: {
        "hero-image": "url('/images/e96e5841821e79f985088d21e301bed7.jpeg')",
        "billing-card": "url('/images/curve.jpg')",
        "curated-bg": "url('/images/gloss_black.jpg')",
      },
    },
  },

  plugins: [require("flowbite/plugin")],
};
