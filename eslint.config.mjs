import { createRequire } from "module";
const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "public/**",
      "static-html/**",
      "scripts/**",
      "data/**",
      "devlog-private/**",
      "docs/**",
      "use-ai-writer-docs/**",
    ],
  },
  {
    rules: {
      // React 19 new rules - these patterns are used intentionally
      // for initializing state from localStorage/external sources
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
