/*
 * @Author: zhizhuo 
 * @Date: 2023-02-02 13:42:49 
 * @Last Modified by: zhizhuo
<<<<<<< HEAD
 * @Last Modified time: 2023-02-24 15:07:56
=======
 * @Last Modified time: 2023-02-24 15:41:49
>>>>>>> 682ee9e31c8b3047b4a2415a1f94c2d42b7a0bfc
 */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// 复制文件到指定目录
const copyFiles = [
  {
    from: path.resolve("src/plugins/manifest.json"),
    to: `${path.resolve("dist")}/manifest.json`
  },
  {
    from: path.resolve("src/plugins/_locales/"),
    to: `${path.resolve("dist")}/_locales/`
  },
  {
    from: path.resolve("src/assets"),
    to: path.resolve("dist/assets")
  },
  {
    from: path.resolve("src/plugins/inject.js"),
    to: path.resolve("dist/js")
  }
];

// 复制插件
const plugins = [
  new CopyWebpackPlugin({
    patterns: copyFiles
  })
];

// 页面文件
const pages = {};
// 配置 popup.html 页面
const chromeName = ["popup"];

chromeName.forEach(name => {
  pages[name] = {
    entry: `src/${name}/main.js`,
    template: `src/${name}/index.html`,
    filename: `${name}.html`
  };
});

// 配置 popup.html 页面
const ChromeName = ["options"];

ChromeName.forEach(name => {
  pages[name] = {
    entry: `src/${name}/main.js`,
    template: `src/${name}/index.html`,
    filename: `${name}.html`
  };
});

module.exports = {
  pages,
  productionSourceMap: false,
  // 配置 content.js background.js
  configureWebpack: {
    entry: {
      background: "./src/background/main.js"
    },
    output: {
      filename: "js/[name].js"
    },
    plugins
  },
  // 配置 content.css
  css: {
    extract: {
      filename: "css/[name].css"
    }
  }
}
