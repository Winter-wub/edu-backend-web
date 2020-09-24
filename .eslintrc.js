module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "react-app",
    "standard",
    "plugin:react/recommended",
    "eslint-config-react-app",
    "prettier/react",
    "prettier/standard",
    "prettier"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {}
};
