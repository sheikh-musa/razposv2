import type { Config } from "tailwindcss";

export default {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Untitled UI color mappings
        primary: "var(--color-bg-primary)",
        primary_hover: "var(--color-bg-secondary_hover)",
        active: "var(--color-bg-active)",
        secondary: "var(--color-fg-secondary)",
        secondary_hover: "var(--color-fg-primary)",
        // Text colors for navigation
        "fg-primary": "var(--color-fg-primary)",
        "fg-secondary": "var(--color-fg-secondary)",
        "fg-tertiary": "var(--color-fg-tertiary)",
        "fg-quaternary": "var(--color-fg-quaternary)",
        "fg-quaternary_hover": "var(--color-fg-quaternary_hover)",
        // Background colors
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-secondary_hover": "var(--color-bg-secondary_hover)",
        "bg-active": "var(--color-bg-active)" /* Lighter selected background */,
        // Focus ring
        "focus-ring": "var(--color-focus-ring)",
      },
      textColor: {
        // Explicit text color mappings for better contrast
        secondary: "var(--color-fg-primary)", // Make nav text darker
        secondary_hover: "var(--color-fg-primary)", // Ensure hover is also dark
        "fg-quaternary": "var(--color-fg-secondary)", // Make icons darker too
      },
      backgroundColor: {
        primary: "var(--color-bg-primary)",
        primary_hover: "var(--color-bg-secondary)",
        active: "var(--color-bg-active)" /* Lighter selected background */,
        secondary_hover: "var(--color-bg-secondary_hover)",
      },
    },
  },
  plugins: [],
} satisfies Config;
