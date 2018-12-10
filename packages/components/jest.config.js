const pkg = require('./package.json');
const defaultConfig = require('../../jest.config.base');


module.exports = Object.assign({}, defaultConfig, {
    name: pkg.name,
    displayName: pkg.name,
    rootDir: './',

    setupTestFrameworkScriptFile: 'jest-dom/extend-expect',
});
