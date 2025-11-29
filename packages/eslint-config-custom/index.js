module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parser: "vue-eslint-parser",
  ignorePatterns: ["**/dist/**", "**/.turbo/**", "**/node_modules/**"],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },
  plugins: ["@typescript-eslint", "import", "unused-imports", "vue"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
  ],
  rules: {
    "no-console": "warn",
    "no-debugger": "warn",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "import/order": "off",
    "vue/multi-word-component-names": "off",
    "vue/require-default-prop": "off",
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {},
    },
  ],
};
