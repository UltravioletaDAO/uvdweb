const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (isProduction) {
        // Production-only optimizations that slow down dev builds if always enabled
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.debug', 'console.warn'],
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
          ],
          splitChunks: {
            chunks: 'all',
            maxAsyncRequests: 10,
            maxInitialRequests: 5,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // Core React vendor bundle
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|@tanstack)[\\/]/,
                name: 'react-vendor',
                priority: 40,
                enforce: true,
              },
              // Web3 libraries (load on demand)
              web3: {
                test: /[\\/]node_modules[\\/](ethers|@ethersproject|thirdweb|@thirdweb-dev|@snapshot-labs)[\\/]/,
                name: 'web3-vendor',
                priority: 30,
                chunks: 'async',
              },
              // /ecosystem: layout del mapa (d3-force + deps) y resaltado de snippets (prismjs).
              // Solo async: nunca entran a vendor/main (puerta: grep forceSimulation -> solo este chunk).
              ecosystemVendor: {
                test: /[\\/]node_modules[\\/](d3-force|d3-quadtree|d3-dispatch|d3-timer|prismjs)[\\/]/,
                name: 'ecosystem-vendor',
                chunks: 'async',
                priority: 35,
                enforce: true,
              },
              // Fase E (escena 3D propia, lazy por click): inerte hasta que exista un import de three.
              threeVendor: {
                test: /[\\/]node_modules[\\/]three[\\/]/,
                name: 'three-vendor',
                chunks: 'async',
                priority: 36,
                enforce: true,
              },
              // UI libraries usadas por los chunks iniciales. chunks:'initial'
              // evita que módulos de framer-motion que solo usan rutas lazy
              // (p.ej. /ecosystem) se cuelen en ui-vendor (ola 3 §9.2).
              ui: {
                test: /[\\/]node_modules[\\/](framer-motion|@heroicons|lucide-react|@radix-ui|tailwind)[\\/]/,
                name: 'ui-vendor',
                priority: 25,
                chunks: 'initial',
              },
              // Módulos de esas mismas libs que SOLO usan rutas lazy: chunk
              // async compartido, en vez de caer al vendor inicial (chunks:'all').
              uiAsync: {
                test: /[\\/]node_modules[\\/](framer-motion|@heroicons|lucide-react|@radix-ui|tailwind)[\\/]/,
                name: 'ui-async',
                priority: 26,
                chunks: 'async',
                reuseExistingChunk: true,
              },
              // Other vendors
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendor',
                priority: 10,
              },
              // Data pesada de /ecosystem (cuerpos de replays + snippets), que
              // ReplayTerm comparte vía require.context con los import() de
              // endpoints.js: chunk async propio, separado del código, para que
              // "/" (HomeTeaser → services/ecosystem) no baje los payloads.
              // El índice compacto (replays/index.json) queda con el código.
              ecosystemData: {
                test: /[\\/]src[\\/]data[\\/]ecosystem[\\/](?!replays[\\/]index\.json)/,
                name: 'ecosystem-data',
                chunks: 'async',
                priority: 7,
                minChunks: 2,
                reuseExistingChunk: true,
              },
              // Compartido de /ecosystem (replays JSON + ventanas/servicios):
              // async con prioridad sobre common para que "/" no lo descargue
              // vía el chunk common inicial (ola 3 §9.3).
              ecosystemShared: {
                test: /[\\/]src[\\/](data|components|services)[\\/]ecosystem[\\/]/,
                name: 'ecosystem-shared',
                chunks: 'async',
                priority: 6,
                minChunks: 2,
                reuseExistingChunk: true,
              },
              // Common chunks
              common: {
                name: 'common',
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
              },
            },
          },
          runtimeChunk: {
            name: 'runtime',
          },
          usedExports: true,
          // sideEffects disabled - causes issues with Web3 libraries
          // sideEffects: false,
        };

        // Plugins that should only run for production bundles
        webpackConfig.plugins = [
          ...webpackConfig.plugins,
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          }),
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              level: 11,
            },
            threshold: 8192,
            minRatio: 0.8,
          }),
          process.env.ANALYZE && new BundleAnalyzerPlugin(),
        ].filter(Boolean);

        webpackConfig.performance = {
          hints: 'warning',
          maxEntrypointSize: 512000,
          maxAssetSize: 512000,
        };
      } else if (process.env.ANALYZE) {
        webpackConfig.plugins = [
          ...webpackConfig.plugins,
          new BundleAnalyzerPlugin(),
        ];
      }

      // Resolve optimizations
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          // Path alias for shadcn/ui components
          '@': path.resolve(__dirname, 'src'),
          // Alias heavy libraries to lighter alternatives if needed
          'moment': 'date-fns',
        },
        // Only necessary extensions
        extensions: ['.js', '.jsx', '.json'],
      };

      // Module rules optimization
      if (isProduction) {
        webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
          if (rule.oneOf) {
            rule.oneOf = rule.oneOf.map(loader => {
              // Optimize image loading
              if (loader.test && loader.test.toString().includes('png|jpg|jpeg|gif|svg')) {
                loader.use = [
                  {
                    loader: require.resolve('url-loader'),
                    options: {
                      limit: 10000,
                      name: 'static/media/[name].[hash:8].[ext]',
                    },
                  },
                  {
                    loader: require.resolve('image-webpack-loader'),
                    options: {
                      mozjpeg: {
                        progressive: true,
                        quality: 65,
                      },
                      optipng: {
                        enabled: true,
                      },
                      pngquant: {
                        quality: [0.65, 0.90],
                        speed: 4,
                      },
                      gifsicle: {
                        interlaced: false,
                      },
                      webp: {
                        quality: 75,
                      },
                    },
                  },
                ];
              }
              return loader;
            });
          }
          return rule;
        });
      }

      return webpackConfig;
    },
  },
};
