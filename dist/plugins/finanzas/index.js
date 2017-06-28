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
class RatesRepository {
    constructor(_indice) {
        this._indice = _indice;
    }
    getPoints() {
        return __awaiter(this, void 0, void 0, function* () {
            const ratesInfo = yield this.getRatesInfo();
            console.log('ratesInfo', ratesInfo);
            return ratesInfo.points;
        });
    }
    findOneByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const ratesInfo = yield this.getRatesInfo();
            name = folerpa_1.Text.withoutTildes(name.toLowerCase());
            return ratesInfo.rates.find(rate => {
                return !!folerpa_1.Text.withoutTildes(rate.name.toLocaleLowerCase()).match(name);
            });
        });
    }
    getRatesInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape(`http://www.eleconomista.es/indice/${this._indice}`);
            const points = Number($('span.ultimo_117').text().replace('.', '').replace(',', '.'));
            const rows = $('.tablalista tr')
                .map((index, tr) => $(tr))
                .get();
            const rates = rows
                .slice(1, rows.length - 1)
                .map(($tr) => {
                const col = (n) => $tr.find('td').eq(n);
                const text = (n) => col(n).text();
                const number = (n) => parseFloat(text(n)
                    .replace(/\./g, '')
                    .replace(/\,/g, '.'));
                return {
                    name: text(0),
                    price: number(1),
                    direction: 'ASC',
                    variationPercentage: number(3),
                    variationPrice: number(4),
                    volume: number(5),
                    capitalization: number(6)
                };
            });
            const graphicUrl = 'http://www.eleconomista.es' + $('.graf-int > a > img').attr('src');
            return {
                points,
                rates,
                graphicUrl
            };
        });
    }
    static getIndiceNormalizado(indice) {
        indice = indice.toLowerCase().replace(/ /g, '');
        switch (indice) {
            case 'ibex35':
            case 'ibex':
                return 'IBEX-35';
        }
    }
}
exports.default = folerpa_1.Middleware.create([
    {
        intent: 'get_puntos',
        entities: [
            'indice'
        ],
        run(request, intent, { indice }) {
            return __awaiter(this, void 0, void 0, function* () {
                const indiceNormalizado = RatesRepository.getIndiceNormalizado(indice[0].value);
                const ratesRepository = new RatesRepository(indiceNormalizado);
                const ratesInfo = yield ratesRepository.getRatesInfo();
                const imageUrl = ratesInfo.graphicUrl;
                const points = ratesInfo.points.toFixed(0);
                const text = folerpa_1.Random.response([
                    () => `El ${indiceNormalizado} está en ${points} puntos`
                ]);
                return {
                    text,
                    imageUrl,
                    type: 1
                };
            });
        }
    },
    {
        intent: 'get_precio_accion',
        entities: [
            'empresa'
        ],
        run(request, intent, { indice, empresa }) {
            return __awaiter(this, void 0, void 0, function* () {
                const index = (indice && indice[0].value) || 'ibex';
                const corporation = empresa[0].value;
                const indexNormalized = RatesRepository.getIndiceNormalizado(index);
                const ratesRepository = new RatesRepository(indexNormalized);
                const rate = yield ratesRepository.findOneByName(corporation);
                let text;
                let type;
                if (!rate) {
                    type = 2;
                    text = folerpa_1.Random.response([
                        () => `La empresa ${corporation} no aparece en el índice ${indexNormalized} 😕`,
                        () => `No encuentro a ${corporation} en el ${indexNormalized} 😕`
                    ]);
                }
                else {
                    type = 1;
                    text = folerpa_1.Random.response([
                        () => `Las acciones de ${rate.name} están a ${rate.price.toFixed(2)}€`,
                        () => `Una acción de ${rate.name} cuesta ${rate.price.toFixed(2)}€`
                    ]);
                }
                return {
                    text,
                    type
                };
            });
        }
    },
    {
        intent: 'get_varacion_accion',
        entities: [
            'empresa'
        ],
        run(request, intent, { indice, empresa }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('empresa', empresa);
                const index = (indice && indice[0].value) || 'ibex';
                const corporation = empresa[0].value;
                const indexNormalized = RatesRepository.getIndiceNormalizado(index);
                const ratesRepository = new RatesRepository(indexNormalized);
                const rate = yield ratesRepository.findOneByName(corporation);
                let text;
                let type;
                if (!rate) {
                    type = 2;
                    text = folerpa_1.Random.response([
                        () => `La empresa ${corporation} no aparece en el índice ${indexNormalized} 😕`,
                        () => `No encuentro a ${corporation} en el ${indexNormalized} 😕`
                    ]);
                }
                else {
                    const tipoVariacion = rate.variationPrice > 0 ? 'subido' : 'bajado';
                    type = 1;
                    text = folerpa_1.Random.response([
                        () => `Las acciones de ${rate.name} han ${tipoVariacion} ${Math.abs(rate.variationPrice).toFixed(2)}€. Ahora mismo están a ${rate.price.toFixed(2)}€.`
                    ]);
                }
                return {
                    text,
                    type
                };
            });
        }
    }
]);
