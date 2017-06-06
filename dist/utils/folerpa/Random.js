"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    static item(items) {
        return items[Math.floor(Math.random() * items.length)];
    }
    static response(items) {
        return Random.item(items)();
    }
}
exports.Random = Random;
