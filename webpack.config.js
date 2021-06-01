// var path = require('path');



// module.exports = {
//     resolve:[{
//         /* assuming that one up is where your node_modules sit,
//            relative to the currently executing script
//         */
//            modules: [path.join(__dirname, '../node_modules')]
//     }]
//   };

const path = require('path');
const webpack = require('webpack');

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, '');
const dirStyles = path.join(__dirname, 'styles');
const dirAssets = path.join(__dirname, 'assets');

/**
 * Webpack Configuration
 */
module.exports = env => {
    // Is the current build a development build
    const IS_DEV = !!env.dev;

    return {

        entry: {
            main: path.join(dirApp, 'index')
        },

        resolve: {
            modules: [
                dirNode,
                dirApp,
                dirStyles,
                dirAssets
            ],
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "stream": false,
                "crypto": false,
                "util": false,
                "os-browserify": false,
                "os": false,
                "assert": false,
                "readline": false,
                "url": false,
                "child_process": false,
                "constants": false,
                "tty": false,

              } 
        },

        plugins: [
            new webpack.DefinePlugin({ IS_DEV })
        ],

        module: {
           
        },

        optimization: {
            runtimeChunk: 'single'
        }

    };
};
