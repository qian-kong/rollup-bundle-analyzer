const commonJs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
const typescript = require("@rollup/plugin-typescript");
const alias = require("@rollup/plugin-alias");
const postcss = require("rollup-plugin-postcss");
const svg = require("rollup-plugin-svg");
const postcssUrl = require("postcss-url");
const replace = require("@rollup/plugin-replace");
const babel = require("@rollup/plugin-babel");

const HTML_TEMPLATE = ["treemap", "sunburst", "network"];

/** @type {import('rollup').RollupOptions} */
module.exports = HTML_TEMPLATE.map((templateType) => ({
  input: `./src/${templateType}/index.jsx`,

  plugins: [
    [
      alias({
        entries: [
          { find: "picomatch", replacement: "picomatch-browser" },
          { find: "react", replacement: "preact/compat" },
          { find: "react-dom/test-utils", replacement: "preact/test-utils" },
          { find: "react-dom", replacement: "preact/compat" },
          { find: "mobx", replacement: require.resolve("mobx/lib/mobx.es6.js") },
        ],
      }),
      resolve({
        mainFields: ["main", "module"],
      }),
      commonJs({
        ignoreGlobal: true,
        include: ["node_modules/**"],
      }),
      babel({
        babelHelpers: "bundled",
        presets: [
          ["@babel/preset-env"],
          [
            "@babel/preset-react",
            {
              runtime: "automatic",
              importSource: "preact",
            },
          ],
        ],
        plugins: [
          "lodash",
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
          ["@babel/plugin-proposal-private-methods", { loose: true }],
        ],
      }),
      postcss({
        extract: true,
        modules: true,
        plugins: [
          postcssUrl({
            url: "inline",
          }),
          require("postcss-icss-values"),
          require("autoprefixer"),
          require("cssnano")(),
        ],
      }),
      svg({
        base64: true,
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
    ],
  ],
  output: {
    format: "iife",
    file: `./dist/lib/${templateType}.js`,
    name: "drawChart",
    exports: "named",
  },
}));
