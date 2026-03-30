// @omenai/tailwind-config/tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  theme: {
    container: {
      padding: { DEFAULT: "1rem" },
      center: true,
    },
    extend: {
      colors: {
        // Your existing Omenai Colors (Untouched)
        primary: "#2A9EDF",
        accentBase: "#f5f5f5",
        accentLight: "#fffdf0",
        dark: "#091830",
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
        "glass-blue": {
          500: "rgba(59, 130, 246, 0.15)", // Tailwind blue-500 @ 15% opacity
        },
        "glass-violet": {
          500: "rgba(139, 92, 246, 0.15)", // Tailwind violet-500 @ 15% opacity
        },

        // 2. THE FIX: Tremor's required color palette
        tremor: {
          brand: {
            faint: "#eff6ff",
            muted: "#bfdbfe",
            subtle: "#60a5fa",
            DEFAULT: "#3b82f6",
            emphasis: "#1d4ed8",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f9fafb",
            subtle: "#f3f4f6",
            DEFAULT: "#ffffff",
            emphasis: "#374151",
          },
          border: {
            DEFAULT: "#e5e7eb",
          },
          ring: {
            DEFAULT: "#e5e7eb",
          },
          content: {
            subtle: "#9ca3af",
            DEFAULT: "#6b7280",
            emphasis: "#374151",
            strong: "#111827",
            inverted: "#ffffff",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: "#172554",
            subtle: "#1e40af",
            DEFAULT: "#3b82f6",
            emphasis: "#60a5fa",
            inverted: "#030712",
          },
          background: {
            muted: "#131A2B",
            subtle: "#1f2937",
            DEFAULT: "#111827",
            emphasis: "#d1d5db",
          },
          border: {
            DEFAULT: "#374151",
          },
          ring: {
            DEFAULT: "#1f2937",
          },
          content: {
            subtle: "#4b5563",
            DEFAULT: "#6b7280",
            emphasis: "#e5e7eb",
            strong: "#f9fafb",
            inverted: "#000000",
          },
        },
      },
      // 3. THE FIX: Tremor's required shadows and fonts
      boxShadow: {
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      safelist: [
        // ... your existing safelist items
        "bg-glass-blue-500",
        "bg-glass-violet-500",
      ],
      fontSize: {
        // Your existing fonts
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
        // Tremor's specific font requirements
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      // Your existing screens, grid, and animations (Untouched)
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
        serif: ["var(--font-pt_serif), serif"],
      },
      gridTemplateColumns: {
        "3cols": "repeat(3, minmax(0, 1fr))",
      },
      backgroundImage: {
        "hero-image": "url('/images/home_bg.png')",
        "billing-card": "url('/images/curve.jpg')",
        "curated-bg": "url('/images/gloss_black.jpg')",
      },
      keyframes: {
        "background-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "100px 100px" },
        },
      },
      animation: {
        "background-move": "background-move 60s linear infinite",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
