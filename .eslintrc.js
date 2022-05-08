module.exports = {
  extends: ["react-app", "plugin:prettier/recommended"],
  plugins: ["@typescript-eslint", "react"],
  rules: {
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    "react/jsx-key": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: false }],
  },
};
