"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const path_1 = require("path");
const plugins = {};
glob.sync(path_1.join(__dirname, '*', 'index.js')).forEach(path => {
    const folderName = path_1.basename(path_1.dirname(path));
    plugins[folderName] = require(path).default;
});
console.log('plugins', plugins);
exports.default = plugins;
