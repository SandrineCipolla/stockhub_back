const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    target: "node",
    // externals: [nodeExternals({
    //     allowlist: ['@prisma/client', '.prisma/client'] // Inclure Prisma dans le bundle
    // })],
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "node_modules/prisma/libquery_engine-*.so.node",
                    to: "node_modules/.prisma/client/",
                    globOptions: {
                        ignore: []
                    }
                },
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
