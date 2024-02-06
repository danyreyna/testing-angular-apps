const {
  esLintOverride,
  getBaseTypeScriptConfig,
  getExtendsArrayWithPrettier,
} = require("./eslint-base-configs.cjs");

const angularOverride = {
  files: ["*.ts"],
  ...getBaseTypeScriptConfig({
    env: { browser: true },
    extendsItems: [
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates",
    ],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  }),
};

const angularTestOverride = {
  files: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  ...getBaseTypeScriptConfig({
    env: { node: true },
    extendsItems: [
      "plugin:jest-dom/recommended",
      "plugin:testing-library/angular",
    ],
  }),
};

const angularHtmlOverride = {
  files: ["*.html"],
  extends: getExtendsArrayWithPrettier(
    "plugin:@angular-eslint/template/recommended",
    "plugin:@angular-eslint/template/accessibility",
  ),
};

const finalConfig = {
  root: true,
  overrides: [
    esLintOverride,
    angularOverride,
    angularTestOverride,
    angularHtmlOverride,
  ],
};

module.exports = finalConfig;
