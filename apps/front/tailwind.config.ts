/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./apps/front/app/**/*.{js,ts,jsx,tsx}",
    "./apps/front/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: { fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },},
  },
  plugins: [],
};
