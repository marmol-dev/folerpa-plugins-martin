"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    static item(items) {
        return items[Math.floor(Math.random() * items.length)];
    }
}
exports.Random = Random;
