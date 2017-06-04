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
const introducciones = [
    'Estas son algunas de las noticias más destacadas de hoy en Ourense',
    'Esto está pasando en Ourense',
    'Los titulares más importantes de hoy en Ourense son',
    'Los titulares de hoy son',
    'La actualidad de Ourense está marcada por'
];
function getTitulares(limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = yield folerpa_1.WebPages.scrape('http://www.laregion.es/seccion/ourense/');
        let titulares = $('h3.title').map((_, titular) => $(titular).text()).get();
        if (limit) {
            titulares = titulares.slice(0, limit);
        }
        return titulares;
    });
}
exports.default = folerpa_1.Middleware.create([
    {
        run(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const titulares = yield getTitulares(5);
                const titularesStr = titulares.map(titulo => `- ${titulo}\n`).join('');
                const text = `${folerpa_1.Random.item(introducciones)}\n${titularesStr}`;
                return {
                    text,
                    type: 1
                };
            });
        }
    }
]);
