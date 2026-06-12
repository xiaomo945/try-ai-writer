import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // App Router 不需要 _document.js，该规则不适用
      "@next/next/no-page-custom-font": "off",
      // useEffect 中同步 setState 用于初始化是常见模式，降级为 warn
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
