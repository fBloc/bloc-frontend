const Color = require("color");

const themeColor = "#09a6e9";

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
        success: "#85C88A",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
