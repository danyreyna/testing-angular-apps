function getExtendsArrayWithPrettier(...extendsItems) {
  /*
   * "prettier" has to be last, so it gets the chance to override other configs
   */
  return [...extendsItems, "prettier"];
}

function getBaseTypeScriptConfig(...extendsItems) {
  return {
    env: {
      browser: true,
      es2021: true,
    },
    extends: getExtendsArrayWithPrettier(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      ...extendsItems,
    ),
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
  };
}

const esLintOverride = {
  files: [".eslintrc.{js,cjs}"],
  env: {
    node: true,
    es2023: true,
  },
  extends: getExtendsArrayWithPrettier("eslint:recommended"),
  parserOptions: {
    sourceType: "script",
  },
};

const angularOverride = {
  files: ["*.ts"],
  ...getBaseTypeScriptConfig(
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
  ),
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
};

const angularTestOverride = {
  files: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  ...getBaseTypeScriptConfig(
    "plugin:jest-dom/recommended",
    "plugin:testing-library/angular",
  ),
};

const angularHtmlOverride = {
  files: ["*.html"],
  extends: getExtendsArrayWithPrettier(
    "plugin:@angular-eslint/template/recommended",
    "plugin:@angular-eslint/template/accessibility",
  ),
  rules: {},
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
