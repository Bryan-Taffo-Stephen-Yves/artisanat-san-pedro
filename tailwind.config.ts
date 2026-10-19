import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ["'Google Sans Flex'", "system-ui", "sans-serif"],
        sans: ["'Google Sans Flex'", "system-ui", "sans-serif"],
        display: ["'Google Sans Flex'", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          "container-lowest": "hsl(var(--surface-container-lowest))",
          "container-low": "hsl(var(--surface-container-low))",
          container: "hsl(var(--surface-container))",
        },
        "inverse-surface": "hsl(var(--inverse-surface))",
        "on-surface": "hsl(var(--on-surface))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "outline-variant": "hsl(var(--outline-variant))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        /* Charte : papier, sable, encre, terre cuite, vert PACTE */
        paper: "#FAF6F1",
        sand: "#F2EAE1",
        ink: { DEFAULT: "#1D1712", soft: "#5F5249", muted: "#6E6158" },
        pacte: { DEFAULT: "#2F6B3E", tint: "#E7F1E9", ink: "#23502F" },
        amber: { tint: "#FFF1CC", ink: "#6B4500" },
        coral: { tint: "#FBE3DF", ink: "#9A2A1A" },
        /* Les anciens dégradés "from-terracotta to-terracotta-light"
           deviennent des aplats terre cuite foncée (boutons de la charte) */
        terracotta: {
          DEFAULT: "#A84F1F",
          light: "#A84F1F",
          bright: "#C3622D",
        },
        /* forest & bordeaux conservés comme alias terracotta pour
           compatibilité — la charte Mains de San Pedro est monochrome */
        forest: {
          DEFAULT: "#A55427",
          light: "#D28962",
          container: "#F6E7DD",
        },
        bordeaux: {
          DEFAULT: "#864521",
          light: "#A55427",
          container: "#F6E7E0",
        },
        clay: {
          50: "#FAF2EE", 100: "#F6E7E0", 200: "#EDD0C0", 300: "#E1B096",
          400: "#D28962", 500: "#C3622D", 600: "#A55427", 700: "#864521",
          800: "#66361B", 900: "#492815",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        bento: "1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
