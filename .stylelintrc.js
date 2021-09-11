module.exports = {
  extends: "stylelint-config-standard",
  rules: {
    "at-rule-no-unknown": [true, {
      ignoreAtRules: ["tailwind", "import", "layer", "each", "function", "use", "return"]
    }],
    "value-keyword-case": null,
    "font-family-no-missing-generic-family-keyword": null,
    "function-name-case": null
  }
}