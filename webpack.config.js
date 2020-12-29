const path = require('path')

module.exports = {
    mode: 'development',
    devtool: "source-map",
    target: "web",
    entry: {
        app: './src/app.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './public'),
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte')
        },
        extensions: ['.ts', '.js', '.svelte'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.svelte$/,
                use: 'svelte-loader',
                exclude: /node_modules/,
            },
        ],
    },
    node: {
        console: false,
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    devServer: {
        contentBase: './public',
        port: 5000,
        stats: 'errors-only',
    }
}
