const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        // sass-loader 13 still calls the legacy render API, which Dart Sass warns about
        // on every compile. Silencing keeps the build output warning-free.
        sassOptions: {
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  },
  configureWebpack: {
    // vue-loader 15 emits `import style0 from './X.vue?vue&type=style...'` for every SFC
    // style block, but its own pitcher re-exports that request with `export *`, which never
    // carries a default. The binding is unused unless the block is a CSS module, so the
    // warning is upstream noise with no fix available from here — 15.11.1 is the last 15.x.
    ignoreWarnings: [/export 'default' \(imported as 'style\d+'\) was not found/]
  }
});
