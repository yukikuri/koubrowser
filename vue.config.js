// vue.config.js

// https://cli.vuejs.org/config/
const TerserPlugin = require('terser-webpack-plugin');
const isProd = process.env.NODE_ENV === "production"
module.exports = {
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: isProd ? [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true
            },
            output: {
              comments: false
            }
          }
        })
      ] : []
    },
  },
  filenameHashing: false,
  pages: {
    main: {
      entry: 'src/renderer/main.ts',
      template: 'public/main.html',
      filename: 'main.html',
      chunks: ['chunk-vendors', 'chunk-common', 'main'],
    },
  },
  pluginOptions: {
    electronBuilder: {
      // Use this to change the entrypoint of your app's main process
      mainProcessFile: 'src/main/main.ts',
      builderOptions: {
        productName: "koubrowser",
        //appId: "com.sample.myapplication",
        win: {
          //icon: 'src/assets/app.ico',
          target: [
            {
              target: 'portable', // 'zip', 'nsis', 'portable'
              //arch: ['x64'] // 'x64', 'ia32'
            }
          ]
        }
      }
    }
  }
}