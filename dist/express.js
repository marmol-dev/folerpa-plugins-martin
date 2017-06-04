"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const plugins_1 = require("./plugins");
const app = express();
app.use(require('body-parser').json());
app.use(require('morgan')('combined'));
Object.keys(plugins_1.default).forEach(route => {
    console.log(`Registering plugin "${route}"`);
    const plugin = plugins_1.default[route];
    app.post(`/${route}`, plugin);
});
exports.default = app;
