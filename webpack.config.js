var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require("webpack");

module.exports = {
    devtool: 'source-map',
    entry: {
        "demo": "./demo/app",
        // "calendar": "./src/calendar/calendar.directive",
    },
    output: {
        path: path.resolve("dist"),
        publicPath: "/public",
        filename: "[name].js"
    },
    devServer: {

    },
    resolve: {
        extensions: ['.js', '.es6', '.ts', '.tsx', '.html', '.css']
    },
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    module: {
        rules: [{
            test: /bootstrap.+\.(jsx|js)$/,
            loader: 'imports-loader?jQuery=jquery,$=jquery'
        }, {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: ["awesome-typescript-loader"]
                // use: ['babel-loader', 'ts-loader']
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: 'css-loader'
            })
        }, {
            test: /\.es6$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                presets: ["es2015"]
            }
        }, {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: "html-loader"
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        }, {
            test: /\.(eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file-loader'
        }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
        }, {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
        }]
    }
}