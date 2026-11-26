/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#090b10",
        panel: "#0f131b",
        card: "#151b24",
        line: "#263141",
        accent: "#2dd4bf",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
