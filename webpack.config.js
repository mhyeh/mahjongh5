"use strict";
const webpack = require('webpack');

module.exports = {
    entry: {
        app: ["./src/App.ts"],
        ["library.bundle"]: ["babel-polyfill", "./src/mahjongh5/Library.ts"],
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            pixi: __dirname + "/node_modules/phaser-ce/build/custom/pixi.js",
            phaser: __dirname + "/node_modules/phaser-ce/build/custom/phaser-no-physics.js",
            p2: __dirname + "/node_modules/phaser-ce/build/custom/p2.js",
            dragonBones: __dirname + "/src/DragonBones/dragonBones.js",
            spine: __dirname + "/src/PhaserSpine/spine-core.js",
            assets: __dirname + "/assets",
            mahjongh5: __dirname + "/src/mahjongh5",
        },
    },
    devServer: {
        contentBase: "./dist",
        host: "140.118.127.157",
        port: 9000,
    },
    module: {
        loaders: [
            { test: /\.ts$/, enforce: "pre", loader: "tslint-loader" },
            { test: /\.ts$/, exclude: /node_modules/, loader: "babel-loader!ts-loader" },
            { test: /\.js$/, include: /src/, loader: "babel-loader" },
            { test: /assets(?=\/|\\)/, loader: "file-loader?name=[hash].[ext]" },
            { test: /\.html?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.svg$/, loader: 'svg-inline-loader' },
        ],
    },
    devtool: "source-map",
    plugins: [
        new webpack.DefinePlugin({
            BUILD_DATE: JSON.stringify((new Date()).toLocaleString()),
            DEBUG: true
        }),
    ],
};
