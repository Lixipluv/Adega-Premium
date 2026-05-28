import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: { DEFAULT: "#6B0F1A", dark: "#4A0A12", deep: "#2A0808" },
        cream: "#F5F0E6",
        gold: { DEFAULT: "#D4AF37", light: "#E5C778" },
        charcoal: "#1A1A1A",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Trajan Pro", "serif"],
        sans: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "13": "3.25rem",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.08)",
        cardHover: "0 8px 28px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
