const iOSHeight = require('@rvxlab/tailwind-plugin-ios-full-height');

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [iOSHeight],
};
