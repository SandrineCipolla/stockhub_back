const path = require('path');
const nodeExternals = require('webpack-node-externals');

//    externals: [nodeExternals()], // Exclut `node_modules` du bundle

module.exports = {
    entry: './src/index.ts', // Point d'entrée de votre application
    target: 'node', // Spécifie que le bundle est pour Node.js, pas pour le navigateur

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: 'production', // Peut être changé à 'development' pour un build non minifié
};
