const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  // externals: [nodeExternals({
  //     allowlist: ['@prisma/client', '.prisma/client'] // Inclure Prisma dans le bundle
  // })],
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/prisma/libquery_engine-*.so.node',
          to: 'node_modules/.prisma/client/',
          globOptions: {
            ignore: [],
          },
        },
        {
          from: 'node_modules/.prisma/client',
          to: 'node_modules/.prisma/client',
        },
        {
          from: 'node_modules/@prisma/client',
          to: 'node_modules/@prisma/client',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // Path aliases for module resolution
    // Note: No trailing slash needed here (unlike tsconfig.json)
    // Webpack automatically resolves sub-paths from these base directories
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@utils': path.resolve(__dirname, 'src/Utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@repositories': path.resolve(__dirname, 'src/repositories'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@authentication': path.resolve(__dirname, 'src/authentication'),
      '@authorization': path.resolve(__dirname, 'src/authorization'),
      '@serverSetup': path.resolve(__dirname, 'src/serverSetup'),
      '@core': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
