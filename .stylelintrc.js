module.exports = {
  extends: "stylelint-config-standard",
  rules: {
    "at-rule-no-unknown": [true, {
      ignoreAtRules: ["tailwind", "import", "layer"]
    }],
    "value-keyword-case": null
  }
}