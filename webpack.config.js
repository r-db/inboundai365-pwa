const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const shouldAnalyze = process.env.ANALYZE === 'true';

  return {
    entry: {
      main: './src/js/app.js'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      clean: true,
      publicPath: '/'
    },

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 8 },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: isProduction,
              passes: 2
            },
            mangle: { safari10: true },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ],

      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },

      runtimeChunk: 'single',
      moduleIds: 'deterministic'
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: '> 0.25%, not dead',
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-transform-runtime'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash:8][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]'
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        } : false
      }),

      new HtmlWebpackPlugin({
        template: './src/about.html',
        filename: 'about.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/features.html',
        filename: 'features.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/docs.html',
        filename: 'docs.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/chat.html',
        filename: 'chat.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/contact.html',
        filename: 'contact.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/admin.html',
        filename: 'admin.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/test-connectivity.html',
        filename: 'test-connectivity.html',
        minify: false
      }),

      new HtmlWebpackPlugin({
        template: './src/offline.html',
        filename: 'offline.html',
        minify: isProduction
      }),

      new HtmlWebpackPlugin({
        template: './src/privacy.html',
        filename: 'privacy.html',
        minify: isProduction,
        inject: 'body'
      }),

      new HtmlWebpackPlugin({
        template: './src/terms.html',
        filename: 'terms.html',
        minify: isProduction,
        inject: 'body'
      }),

      // Copy service worker and tenant loader in development
      ...(!isProduction ? [
        new CopyWebpackPlugin({
          patterns: [
            { from: './src/sw.js', to: 'sw.js' },
            { from: './src/js/tenant-loader.js', to: 'js/tenant-loader.js' }
          ]
        })
      ] : [
        new CopyWebpackPlugin({
          patterns: [
            { from: './src/js/tenant-loader.js', to: 'js/tenant-loader.js' }
          ]
        })
      ]),

      ...(isProduction ? [
        new InjectManifest({
          swSrc: './src/sw.js',
          swDest: 'sw.js',
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        }),

        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),

        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
          filename: '[path][base].br'
        })
      ] : []),

      ...(shouldAnalyze ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-report.html',
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: 'bundle-stats.json'
        })
      ] : [])
    ],

    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 4001,
      hot: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/about$/, to: '/about.html' },
          { from: /^\/features$/, to: '/features.html' },
          { from: /^\/docs$/, to: '/docs.html' },
          { from: /^\/chat$/, to: '/chat.html' },
          { from: /^\/contact$/, to: '/contact.html' },
          { from: /^\/privacy$/, to: '/privacy.html' },
          { from: /^\/terms$/, to: '/terms.html' },
          { from: /^\/$/, to: '/index.html' }
        ]
      },
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      },
      open: true
    },

    performance: {
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
      hints: isProduction ? 'warning' : false
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
