import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: "#101625",
        "surface-elevated": "#172033",
        border: "#202C44",
        "border-hover": "#2E3F61",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          glow: "rgba(37, 99, 235, 0.25)",
        },
        accent: "#38BDF8",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#94A3B8",
        subtle: "#64748B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

