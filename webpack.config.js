const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/js/index.js',
    output: {
        filename: 'index.bundle.js',
        path: path.resolve(__dirname, 'build')
    }
};