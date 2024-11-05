// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  files: ["**/*.ts"],

  ignores: ["**/node_modules/**", "**/dist/**"],
  rules: {
    "no-undef": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
});
