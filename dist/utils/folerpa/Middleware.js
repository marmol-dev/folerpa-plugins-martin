"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Middleware {
    static create(handlers) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const loop = (i = 0) => __awaiter(this, void 0, void 0, function* () {
                if (i === handlers.length) {
                    throw new Error('No handler');
                }
                else {
                    try {
                        const res = yield handlers[i].run(req.body);
                        if (res instanceof Object) {
                            return res;
                        }
                        else {
                            throw null;
                        }
                    }
                    catch (e) {
                        loop(i + 1);
                    }
                }
            });
            try {
                const response = yield loop();
                res.json(response);
            }
            catch (e) {
                res.sendStatus(500);
            }
        });
    }
}
exports.Middleware = Middleware;
