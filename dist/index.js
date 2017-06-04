"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("./express");
const PORT = 4006;
express_1.default.listen(PORT, err => {
    if (err) {
        console.error(err);
    }
    else {
        console.log(`Plugins listening on port ${PORT}`);
    }
});
