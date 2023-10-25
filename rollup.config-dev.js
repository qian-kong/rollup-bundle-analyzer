const commonJs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
const alias = require("@rollup/plugin-alias");
const postcss = require("rollup-plugin-postcss");
const svg = require("rollup-plugin-svg");
const babel = require("@rollup/plugin-babel");

const { visualizer } = require(".");

const HTML_TEMPLATE = ["treemap", "sunburst", "network"];
const PLAIN_TEMPLATE = ["raw-data", "list"];
const ALL_TEMPLATE = [...HTML_TEMPLATE, ...PLAIN_TEMPLATE];

const chooseExt = (template) => {
  if (template === "raw-data") return ".json";

  if (template === "list") return ".yml";

  return ".html";
};

/** @type {import('rollup').RollupOptions} */
module.exports = ALL_TEMPLATE.map((templateType) => ({
  input: Object.fromEntries(HTML_TEMPLATE.map((t) => [t, `./src/${t}/index.jsx`])),

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
      svg({
        base64: true,
      }),
      postcss({
        extract: true,
        modules: true,
        plugins: [require("postcss-icss-values"), require("autoprefixer"), require("cssnano")()],
      }),
      visualizer({
        title: `dev build ${templateType}`,
        filename: `stats.${templateType}${chooseExt(templateType)}`,
        template: templateType,
        gzipSize: true,
        brotliSize: true,
        sourcemap: !!process.env.SOURCEMAP,
        open: !!process.env.OPEN,
      }),
    ],
  ],

  output: {
    format: "es",
    dir: `./temp/`,
    sourcemap: !!process.env.SOURCEMAP,
  },
}));
