# Rollup Bundle Analyzer

可视化分析rollup打包后的模块占用空间。

## 安装

```sh
npm install --save-dev rollup-bundle-analyzer
```

## 使用

```javascript
// es
import { visualizer } from "rollup-bundle-analyzer";
// or
// cjs
const { visualizer } = require("rollup-bundle-analyzer");
```

在rollup中适用 (rollup.config.js)

```js
module.exports = {
  plugins: [
    visualizer(),
  ],
};
```

在vite中使用 (vite.config.js)

```js
module.exports = {
  plugins: [visualizer()],
};
```

打包后会在根目录下生成 `stats.html`.