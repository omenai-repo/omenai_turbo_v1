/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
      },
      center: true,
    },
    // fontSize: {
    //   xxxs: "0.56rem",
    //   xxs: "0.625rem",
    //   xs: "0.8125rem",
    //   base: "1rem",
    //   sm: "1.2rem",
    //   md: "1.44rem",
    //   lg: "1.625rem",
    //   xl: "2.074rem",
    //   "2xl": "2.488rem",
    //   "3xl": "2.986rem",
    // },
    extend: {
      colors: {
        primary: "#2A9EDF",
        dark: "#1a1a1a",
        gray: {
          200: "#47748E",
          300: "#F6F6F6",
          400: "#F4F4F4",
          800: "#FCFCFC",
          light: "#818181",
        },
        sliderTrack: "#e0e0e0",
        sliderThumb: "#ff5722",
        sliderThumbHover: "#e64a19",

        line: "#DEDEDE",
        authSideDark: "#1a1a1a",
      },
      fontSize: {
        "fluid-xxs": "clamp(0.625rem, 0.25vw + 0.5rem, 0.75rem)", // 10 > 12px
        "fluid-xs": "clamp(0.75rem, 0.9vw + 0.2rem, 0.875rem)", // 12px → 14px
        "fluid-base": "clamp(0.875rem, 1vw + 0.2rem, 1rem)", // 14px → 16px
        "fluid-sm": "clamp(1rem, 1.1vw + 0.2rem, 1.125rem)", // 16px → 18px
        "fluid-md": "clamp(1.125rem, 1.2vw + 0.25rem, 1.25rem)", // 18px → 20px
        "fluid-lg": "clamp(1.25rem, 1.5vw + 0.25rem, 1.5rem)", // 20px → 24px
        "fluid-xl": "clamp(1.5rem, 2vw + 0.25rem, 1.875rem)", // 24px → 30px
        "fluid-2xl": "clamp(1.875rem, 2.5vw + 0.25rem, 2.25rem)", // 30px → 36px
        "fluid-3xl": "clamp(2.25rem, 3vw + 0.25rem, 2.625rem)", // 36px → 42px
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
        sans: ["var(--font-sans-serif)"],
      },

      backgroundImage: {
        "hero-image": "url('/images/home_bg.png')",
        "billing-card": "url('/images/curve.jpg')",
        "curated-bg": "url('/images/gloss_black.jpg')",
      },
    },
  },

  plugins: [require("flowbite/plugin")],
};
