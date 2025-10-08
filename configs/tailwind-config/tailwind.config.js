// @omenai/tailwind-config/tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    container: {
      padding: { DEFAULT: "1rem" },
      center: true,
    },
    extend: {
      colors: {
        primary: "#2A9EDF",
        dark: "#0f172a",
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
        authSideDark: "#0f172a",
      },
      fontSize: {
        "fluid-3xs": "clamp(0.625rem, 0.2vw + 0.55rem, 0.75rem)",
        "fluid-xxs": "clamp(0.7rem, 0.25vw + 0.65rem, 0.79rem)",
        "fluid-xs": "clamp(0.79rem, 0.35vw + 0.7rem, 0.889rem)",
        "fluid-base": "clamp(0.889rem, 0.5vw + 0.8rem, 1rem)",
        "fluid-sm": "clamp(1rem, 0.6vw + 0.9rem, 1.125rem)",
        "fluid-md": "clamp(1.125rem, 0.8vw + 1rem, 1.266rem)",
        "fluid-lg": "clamp(1.266rem, 1vw + 1.1rem, 1.422rem)",
        "fluid-xl": "clamp(1.422rem, 1.2vw + 1.2rem, 1.602rem)",
        "fluid-2xl": "clamp(1.602rem, 1.5vw + 1.3rem, 1.802rem)",
        "fluid-3xl": "clamp(1.802rem, 2vw + 1.4rem, 2.027rem)",
      },
      gridTemplateColumns: {
        "3cols": "repeat(3, minmax(0, 1fr))",
      },
      screens: {
        xs: "460px",
        xxl: "400px",
        xxm: "380px",
        xxs: "320px",
        md: "768px",
        lg: "991px",
        xl: "1280px",
        "2lg": "1024px",
        "2xl": "1440px",
        "3xl": "1560px",
      },
      fontFamily: {
        sans: ["var(--font-work_sans), sans-serif"],
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
