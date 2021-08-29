module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{jsx,js,tsx,ts}"],
  darkMode: false,
  theme: {
    extend: {
      transitionProperty: {
        bg: "background, backgroundColor",
      },
    },
  },
  variants: {
    extend: {
      textColor: ["hover"],
    },
  },
  plugins: [],
};
