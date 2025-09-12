import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})
// todo: lint-staged setup
// https://nextjs.org/docs/pages/api-reference/config/eslint#running-lint-on-staged-files

// https://nextjs.org/docs/pages/api-reference/config/eslint
// https://typescript-eslint.io/
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      "out/**",
      "build/**",
      "android/**",
      "ios/**",
      ".expo/**",
      "**/build/**",
      "**/dist/**",
      "**/intermediates/**",
      "**/EXDevMenuApp.android.js",
      "metro.config.js",
    ],
  },
  ...compat.config({
    parser: "@typescript-eslint/parser",
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
    plugins: ["@typescript-eslint"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/strict-type-checked",
      "plugin:@typescript-eslint/stylistic-type-checked",
    ],
    rules: {
      // force type imports to be separate from class imports
      "@typescript-eslint/no-import-type-side-effects": "error",
      // I disagree with strictTypeChecked, numbers are fine in here.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
      // some variables are built different
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // used in some shorthand event handlers
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true,
        },
      ],
      // downgrade to warn as some radix-ui components return any
      "@typescript-eslint/no-unsafe-assignment": ["off"],
      "@typescript-eslint/no-unsafe-return": ["off"],
      "@typescript-eslint/no-unsafe-call": ["off"],
      "@typescript-eslint/no-unsafe-member-access": ["off"],
      // Only warn on any
      "@typescript-eslint/no-explicit-any": ["warn"],
      // Allow require imports
      "@typescript-eslint/no-require-imports": ["off"],
    },
  }),
]

export default eslintConfig
