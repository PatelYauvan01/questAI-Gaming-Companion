/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces, darkest to lightest. Names kept from the original theme so
        // existing classes keep working.
        shell: "#07090d",
        panel: "#0b0f15",
        card: "#10151d",
        elevated: "#161c26",
        line: "#1e2631",
        "line-strong": "#2a3442",
        accent: {
          DEFAULT: "#2dd4bf",
          strong: "#5eead4",
          ink: "#032a25",
        },
        ink: {
          1: "#eef2f7",
          2: "#b3bdcb",
          3: "#8590a1",
        },
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0, 0, 0, 0.28)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
        lift: "0 1px 0 rgba(255,255,255,0.05) inset, 0 22px 44px -18px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(45,212,191,0.35), 0 8px 30px -8px rgba(45,212,191,0.35)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        rise: "rise 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "fade-in": "fade-in 0.2s ease-out backwards",
        "scale-in": "scale-in 0.18s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
