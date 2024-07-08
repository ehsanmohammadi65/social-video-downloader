const { defineConfig } = require("@vue/cli-service");
require("dotenv").config({ override: true, path: "./.env" });

module.exports = defineConfig({
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  transpileDependencies: true,
  devServer: {
    hot: true,
  },
});
