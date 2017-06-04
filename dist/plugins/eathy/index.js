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
const folerpa_1 = require("../../utils/folerpa");
exports.default = folerpa_1.Middleware.create([
    {
        entities: [
            'alimento'
        ],
        intent: 'get_calorías',
        run(request) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('request', request);
                const { intent, alimento } = request.conversation.messages[0].messageValidation.data.entities;
                if (intent && intent.length > 0) {
                    let nombreAlimento;
                    if (alimento && alimento.length > 0) {
                        nombreAlimento = alimento[0].value;
                    }
                    if (nombreAlimento) {
                        return {
                            text: `Aún no conozco cuántas calorías tiene "${nombreAlimento}", pero muy pronto lo sabré! 💪`,
                            type: 1
                        };
                    }
                }
            });
        }
    }
]);
