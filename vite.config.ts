import legacyPlugin from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import path from 'path';
import externalGlobals from 'rollup-plugin-external-globals';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import viteImagemin from 'vite-plugin-imagemin';
import svgrPlugin from 'vite-plugin-svgr';

/**
 * 不需要打包的库
 */
const globals = externalGlobals({
  moment: 'moment',
  'video.js': 'videojs',
  jspdf: 'jspdf',
  xlsx: 'XLSX',
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  // 判断当前是否为测试环境，注意构建命令要使用 vite build --mode test
  const isTest = mode === 'test';

  return {
    /**
     * 在生产中服务时的基本公共路径。
     * @default '/'
     */
    base: '/',
    /**
     * 与“根”相关的目录，构建输出将放在其中。如果目录存在，它将在构建之前被删除。
     * @default 'dist'
     */
    // publicDir: '',
    resolve: {
      // 起个别名，在引用资源时，可以用'@/资源路径'直接访问
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // 配置前端服务地址和端口
    server: {
      // 禁用或配置 HMR 连接
      // hmr: { overlay: false },
      host: '0.0.0.0',
      port: 8090,
      // 是否自动在浏览器打开
      open: true,
      // 是否开启 https
      https: false,
      // 服务端渲染
      // ssr: false,
      // 设置反向代理，跨域
      proxy: {
        '/data/api': {
          changeOrigin: true,
          target: 'http://127.0.0.1:8080', // 开发环境
        },
        '/data/admin': {
          changeOrigin: true,
          target: 'http://127.0.0.1:8080', // 开发环境
        },
      },
    },
    // 打包配置
    build: {
      // vite 在 build 的时候默认会进行压缩计算，但 vite 实际上不提供 gzip 压缩功能，
      // 所以不需要让他花时间算压缩后大小，关掉这个设置可以提升打包速度。
      // brotliSize: false, // 默认为 true
      // 输出路径
      outDir: 'build',
      // 指定生成静态资源的存放路径，从生成的资源覆写 filename 或 chunkFilename 时，assetsDir 会被忽略
      assetsDir: 'static',
      // 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
      assetsInlineLimit: 4096,
      //启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 构建后是否生成 source map 文件
      sourcemap: false,
      // 浏览器兼容性  "esnext"|"modules"
      target: 'modules',
      // 设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器: boolean | 'terser' | 'esbuild'
      minify: 'terser',
      // 当设置为 true，构建后将会生成 manifest.json 文件
      manifest: false,

      terserOptions: {
        compress: {
          //生产环境时移除console
          drop_console: true,
          drop_debugger: true,
        },
      },
      // 取消计算文件大小，加快打包速度
      reportCompressedSize: false,
      // 自定义底层的 Rollup 打包配置
      rollupOptions: {
        // output: {
        //   chunkFileNames: 'js/[name]-[hash].js',
        //   entryFileNames: 'js/[name]-[hash].js',
        //   assetFileNames: '[ext]/[name]-[hash].[ext]',
        // },

        // external: ['moment', 'video.js', 'jspdf', 'xlsx'],
        plugins: [globals],
      },
      // 默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
      emptyOutDir: true,
    },
    esbuild: {},
    // 引入第三方的配置,强制预构建插件包
    optimizeDeps: {
      // include: ["moment", "echarts", "axios"]
    },
    plugins: [
      react(),
      viteCompression({
        //生成压缩包gz
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 50,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
      // 为打包后的文件提供传统浏览器兼容性支持
      !isTest &&
        legacyPlugin({
          targets: ['defaults', 'not IE 11'],
        }),
      createHtmlPlugin({
        minify: true,
        entry: 'src/main.tsx',
        template: 'index.html',
        inject: {
          data: {
            polyfill: isTest
              ? 'https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces2018%2Ces2019%2Ces2020%2Ces2021%2Ces2022'
              : '',
          },
        },
      }),

      svgrPlugin({
        svgrOptions: {
          icon: true,
          // ...svgr options (https://react-svgr.com/docs/options/)
        },
      }),

      // 将 visualizer 插件放到最后的位置
      visualizer(),
    ],

    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript，支持 less 内联 JS
          javascriptEnabled: true,
          // 注入全局样式文件
          additionalData: '@import "@/global.less";',
        },
      },
    },
    json: {
      //是否支持从 .json 文件中进行按名导入
      namedExports: true,
      //若设置为 true，导入的 JSON 会被转换为 export default JSON.parse("...") 会比转译成对象字面量性能更好，
      //尤其是当 JSON 文件较大的时候。
      //开启此项，则会禁用按名导入
      stringify: false,
    },
  };
});
