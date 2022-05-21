const Color = require("color");

const themeColor = "#4fc1e9";

module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{jsx,js,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: Color(themeColor).alpha(0.1).string(),
          100: Color(themeColor).alpha(0.2).string(),
          300: Color(themeColor).alpha(0.8).string(),
          400: themeColor,
          500: Color(themeColor).darken(0.1).string(),
          600: Color(themeColor).darken(0.2).string(),
        },
        success: "#4ade80",
        warning: "#EC994B",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
