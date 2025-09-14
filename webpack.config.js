const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    target: "node",
    externals: [nodeExternals({
        allowlist: [] // Exclure tous les modules node_modules du bundle, y compris Prisma
    })],
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "node_modules/.prisma/client",
                    to: "node_modules/.prisma/client",
                },
                {
                    from: "node_modules/@prisma/client",
                    to: "node_modules/@prisma/client",
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    mode: "production",
};
