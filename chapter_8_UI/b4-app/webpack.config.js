const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const distDir = path.resolve(__dirname, 'dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './app/index.ts',
    output: {
        filename: 'bundle.js',
        path: distDir,
    },
    devServer: {
        contentBase: distDir,
        port: 60800,
        proxy: {
            '/api': 'http://localhost:60702',
            '/es': {
                target: 'http://localhost:9200',
                pathRewrite: {'^/es': ''},
            }
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Better Book Bundle Builder',
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new ExtractTextPlugin("styles.css"),
    ],
    module: {
        rules: [{
        test: /\.ts$/,
        loader: 'ts-loader',
        },{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            use: 'css-loader',
            fallback: 'style-loader',
          }
        ),
        },{
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000',
        }],
        },
};

