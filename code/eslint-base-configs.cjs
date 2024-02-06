function getExtendsArrayWithPrettier(...extendsItems) {
  /*
   * "prettier" has to be last, so it gets the chance to override other configs
   */
  return [...extendsItems, "prettier"];
}

function getBaseJavaScriptConfig({
  env = {},
  extendsItems = [],
  parserOptions = {},
  rules = {},
} = {}) {
  return {
    env: {
      es2023: true,
      ...env,
    },
    extends: getExtendsArrayWithPrettier("eslint:recommended", ...extendsItems),
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ...parserOptions,
    },
    rules: {
      ...rules,
    },
  };
}

function getBaseTypeScriptConfig({
  env = {},
  extendsItems = [],
  parserOptions = {},
  rules = {},
} = {}) {
  return {
    ...getBaseJavaScriptConfig({
      env,
      extendsItems: ["plugin:@typescript-eslint/recommended", ...extendsItems],
      parserOptions,
      rules,
    }),
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
  };
}

const esLintOverride = {
  files: [".eslintrc.{js,cjs}"],
  ...getBaseJavaScriptConfig({
    env: {
      node: true,
    },
    parserOptions: {
      sourceType: "script",
    },
  }),
};

module.exports = {
  getExtendsArrayWithPrettier,
  getBaseJavaScriptConfig,
  getBaseTypeScriptConfig,
  esLintOverride,
};
