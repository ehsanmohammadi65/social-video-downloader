const { defineConfig } = require("@vue/cli-service");
require("dotenv").config({ override: true, path: "./.env" });

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    hot: true,
  },
});
