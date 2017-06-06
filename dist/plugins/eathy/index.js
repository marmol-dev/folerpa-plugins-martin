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
class AlimentosRepository {
    static findByNombre(nombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield folerpa_1.WebPages.scrape(`http://www.dietasan.com/alimentos/informacionNutricional.aspx?alimento=${encodeURIComponent(folerpa_1.Text.withoutTildes(nombre))}`);
            const t = (fila) => Number($('#ctl00_ContentPlaceHolder1_InfoAlimento > table').eq(0).find('tr').eq(fila).find('td').eq(1).text().match(/\d+/)[0]);
            return {
                nombre,
                energia: t(1),
                hidratosCarbono: t(2),
                grasas: t(3),
                proteinas: t(4)
            };
        });
    }
}
exports.default = folerpa_1.Middleware.create([
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_calorías',
        run(request, intent, { alimento, articulo }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreAlimento }] = alimento;
                const [{ value: valorArticulo }] = articulo;
                let text;
                try {
                    const alimento = yield AlimentosRepository.findByNombre(nombreAlimento);
                    text = `${folerpa_1.Text.capitalize(valorArticulo)} ${nombreAlimento} tiene ${alimento.energia} Kcal por cada 100 gramos 💪`;
                }
                catch (e) {
                    text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`;
                }
                return {
                    text,
                    type: 1
                };
            });
        }
    },
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_proteinas',
        run(request, intent, { alimento, articulo }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreAlimento }] = alimento;
                const [{ value: valorArticulo }] = articulo;
                let text;
                try {
                    const alimento = yield AlimentosRepository.findByNombre(nombreAlimento);
                    text = folerpa_1.Random.response([
                        () => `${folerpa_1.Text.capitalize(valorArticulo)} ${alimento.nombre} tiene un ${alimento.proteinas}% de proteínas 💪`,
                        () => `${alimento.proteinas}g de cada 100 son proteínas en ${valorArticulo} ${alimento.nombre}`,
                        () => `De cada 100g, ${alimento.proteinas} son proteínas en ${valorArticulo} ${alimento.nombre}`
                    ]);
                }
                catch (e) {
                    text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`;
                }
                return {
                    text,
                    type: 1
                };
            });
        },
    },
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_nutrientes',
        run(request, intent, { alimento, articulo }) {
            return __awaiter(this, void 0, void 0, function* () {
                const [{ value: nombreAlimento }] = alimento;
                const [{ value: valorArticulo }] = articulo;
                let text;
                try {
                    const alimento = yield AlimentosRepository.findByNombre(nombreAlimento);
                    const entradilla = folerpa_1.Random.response([
                        () => `${folerpa_1.Text.capitalize(valorArticulo)} ${alimento.nombre} está compuesto por los siguientes nutrientes por cada 100g:`,
                        () => `${folerpa_1.Text.capitalize(valorArticulo)} ${alimento.nombre} tiene la siguiente información nutricional por cada 100g:`,
                        () => `En 100g de ${alimento.nombre} hay los siguientes nutrientes:`,
                    ]);
                    const nutrientes = [
                        ['Energía', alimento.energia, 'Kcal'],
                        ['Proteínas', alimento.proteinas, 'g'],
                        ['Hidratos de carbono', alimento.hidratosCarbono, 'g'],
                        ['Grasas', alimento.grasas, 'g']
                    ];
                    const nutrientesTexto = nutrientes.map(([titulo, cantidad, unidad]) => `- ${titulo}: ${cantidad}${unidad}`).join('\n');
                    text = `${entradilla}\n\n${nutrientesTexto}`;
                }
                catch (e) {
                    text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`;
                }
                return {
                    text,
                    type: 1
                };
            });
        },
    }
]);
