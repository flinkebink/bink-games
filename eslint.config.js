import globals from "globals";

export default [
  {
    files: ["games/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-undef": "error",
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-func-assign": "error",
      "no-sparse-arrays": "error",
      "no-unexpected-multiline": "error",
      "valid-typeof": "error",
    },
  },
];
