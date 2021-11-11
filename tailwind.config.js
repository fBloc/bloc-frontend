module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{jsx,js,tsx,ts}"],
  darkMode: false,
  theme: {
    scale: {
      80: "0.8",
    },
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
